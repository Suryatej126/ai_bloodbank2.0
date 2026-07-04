from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user, RoleChecker
from app.models.models import User, Inventory, AuditLog
from app.schemas.schemas import InventoryCreate, InventoryOut, InventoryUpdate
from typing import List, Optional
from datetime import datetime, date, timedelta

router = APIRouter(prefix="/inventory", tags=["Inventory Management"])

@router.post("/", response_model=InventoryOut, status_code=status.HTTP_201_CREATED)
def create_inventory(
    item_in: InventoryCreate,
    current_user: User = Depends(RoleChecker(["admin", "hospital", "bloodbank"])),
    db: Session = Depends(get_db)
):
    # Add inventory
    db_item = Inventory(
        owner_id=current_user.id,
        blood_group=item_in.blood_group,
        quantity=item_in.quantity,
        expiry_date=item_in.expiry_date,
        storage_temp=item_in.storage_temp,
        status=item_in.status
    )
    db.add(db_item)
    
    # Audit log
    db_log = AuditLog(
        user_id=current_user.id,
        action="Add Inventory",
        details=f"Added {item_in.quantity} units of {item_in.blood_group}"
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_item)
    
    return db_item

@router.get("/", response_model=List[InventoryOut])
def list_inventory(
    blood_group: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Inventory)
    
    # If hospital or blood bank, they primarily view their own stock unless admin/patient/donor
    if current_user.role in ["hospital", "bloodbank"]:
        query = query.filter(Inventory.owner_id == current_user.id)
        
    if blood_group:
        query = query.filter(Inventory.blood_group == blood_group)
    if status:
        query = query.filter(Inventory.status == status)
        
    return query.all()

@router.put("/{item_id}", response_model=InventoryOut)
def update_inventory(
    item_id: int,
    item_update: InventoryUpdate,
    current_user: User = Depends(RoleChecker(["admin", "hospital", "bloodbank"])),
    db: Session = Depends(get_db)
):
    db_item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory item not found")
        
    # Ensure ownership
    if current_user.role != "admin" and db_item.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    for key, value in item_update.dict(exclude_unset=True).items():
        setattr(db_item, key, value)
        
    # Audit log
    db_log = AuditLog(
        user_id=current_user.id,
        action="Update Inventory",
        details=f"Updated item ID {item_id}: new qty={db_item.quantity}, status={db_item.status}"
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_item)
    
    return db_item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventory(
    item_id: int,
    current_user: User = Depends(RoleChecker(["admin", "hospital", "bloodbank"])),
    db: Session = Depends(get_db)
):
    db_item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory item not found")
        
    if current_user.role != "admin" and db_item.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    # Audit log
    db_log = AuditLog(
        user_id=current_user.id,
        action="Delete Inventory",
        details=f"Deleted inventory item ID {item_id} ({db_item.quantity} units of {db_item.blood_group})"
    )
    db.add(db_log)
    db.delete(db_item)
    db.commit()
    
    return None

@router.get("/summary")
def get_inventory_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns summary count of total units grouped by blood group."""
    # Base query
    query = db.query(
        Inventory.blood_group,
        func.sum(Inventory.quantity).label("total_quantity"),
        func.count(Inventory.id).label("total_batches")
    ).filter(Inventory.status == "available")
    
    # If the user is hospital/bloodbank, return their specific inventory summary
    if current_user.role in ["hospital", "bloodbank"]:
        query = query.filter(Inventory.owner_id == current_user.id)
        
    results = query.group_by(Inventory.blood_group).all()
    
    summary = {bg: 0.0 for bg in ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
    batches = {bg: 0 for bg in ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
    
    for r in results:
        if r.blood_group in summary:
            summary[r.blood_group] = float(r.total_quantity)
            batches[r.blood_group] = int(r.total_batches)
            
    # Include list of expiring items soon (within next 7 days)
    today = date.today()
    expiring_soon = db.query(Inventory).filter(
        Inventory.status == "available",
        Inventory.expiry_date >= today,
        Inventory.expiry_date <= today + timedelta(days=7)
    )
    
    if current_user.role in ["hospital", "bloodbank"]:
        expiring_soon = expiring_soon.filter(Inventory.owner_id == current_user.id)
        
    expiring_items = []
    for item in expiring_soon.all():
        expiring_items.append({
            "id": item.id,
            "blood_group": item.blood_group,
            "quantity": item.quantity,
            "expiry_date": item.expiry_date.strftime("%Y-%m-%d"),
            "storage_temp": item.storage_temp
        })
        
    return {
        "stock": summary,
        "batches": batches,
        "expiring_soon": expiring_items
    }
