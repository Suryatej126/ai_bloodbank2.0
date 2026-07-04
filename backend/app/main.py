from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import auth, inventory, requests, ai
from app.db.seeder import seed_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent blood matching, inventory forecasts, emergency routing, and donor gamification.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development. Can restrict to specific domains in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(inventory.router, prefix=settings.API_V1_STR)
app.include_router(requests.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    # Setup tables and seed initial database records
    seed_db()
    
    # Models are already auto-trained on engine import if not present,
    # so we log success here.
    print(f"AI Powered Digital Blood Bank API is online and fully configured.")

@app.get("/", tags=["General"])
def read_root():
    return {
        "status": "online",
        "app_name": settings.PROJECT_NAME,
        "api_version": "v1.0.0",
        "docs_url": "/docs"
    }
