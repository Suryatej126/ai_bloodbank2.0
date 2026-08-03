import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Mic, MicOff, Bot, Settings, Key, AlertCircle } from "lucide-react";
import { api } from "../services/api";

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Hello! I am your AI Blood Bank Assistant. How can I help you today? You can type a question, select a popular topic below, or click the mic to speak to me!" }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, showSettings, isTyping]);

  // Setup Web Speech API for voice search
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSendMessage(transcript);
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsTyping(true);

    try {
      const reply = await api.chatbotQuery(text);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech-to-text is not supported in this browser. Try Google Chrome or Microsoft Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const triggerQuickQuestion = (q: string) => {
    handleSendMessage(q);
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 select-none">
      {/* Floating Toggle Icon */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="relative bg-gradient-to-tr from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-full p-4 shadow-[0_8px_32px_rgba(244,63,94,0.3)] border border-rose-500/25 cursor-pointer flex items-center justify-center"
          >
            <MessageSquare size={24} />
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[calc(100vh-6rem)] backdrop-blur-2xl bg-slate-900/85 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-750 to-rose-600 p-4 text-white flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="bg-white/10 p-2 rounded-xl flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight tracking-wide">Assistant AI</h3>
                  <p className="text-[10px] text-rose-200 leading-none mt-0.5">
                    {localStorage.getItem("gemini_api_key") ? "Online • Live Gemini 1.5" : "Online • Rules Base"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`text-white/80 hover:text-white transition-colors cursor-pointer p-2 rounded-xl hover:bg-white/10 ${showSettings ? "bg-white/15 text-white" : ""}`}
                  title="Gemini Key Config"
                >
                  <Settings size={16} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer p-2 rounded-xl hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body Content */}
            <AnimatePresence mode="wait">
              {showSettings ? (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 p-5 bg-slate-950/95 flex flex-col justify-between text-xs text-slate-300"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                      <Key size={16} className="text-rose-500" />
                      <h4 className="font-bold text-slate-100 text-sm tracking-wide">Gemini API Configuration</h4>
                    </div>
                    
                    <p className="text-slate-450 leading-relaxed text-[11px]">
                      Provide your Gemini API key to enable live, production-grade responses powered by <strong>Gemini 1.5 Flash</strong>. Without a key, the chatbot will run on a local rules-based simulation.
                    </p>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Gemini API Key
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 px-3.5 text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-rose-500/50 focus:bg-white/[0.04] transition-all font-mono"
                      />
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <AlertCircle size={14} className="text-rose-400" />
                        <span className="font-black text-[9px] uppercase tracking-wider text-slate-300">Privacy & Security</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Your key is stored strictly on your local browser's storage and is only passed via HTTPS to your locally-hosted backend API.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 border-t border-white/5 pt-4">
                    <button
                      onClick={() => {
                        if (apiKey.trim()) {
                          localStorage.setItem("gemini_api_key", apiKey.trim());
                        } else {
                          localStorage.removeItem("gemini_api_key");
                        }
                        setShowSettings(false);
                      }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-bold text-center transition-all cursor-pointer shadow-md shadow-rose-600/25"
                    >
                      Save Config
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem("gemini_api_key");
                        setApiKey("");
                        setShowSettings(false);
                      }}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-400 hover:text-slate-200 rounded-xl font-bold transition-all cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {/* Messages body */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/45 scrollbar-thin">
                    {messages.map((m, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                          m.role === "user" 
                            ? "bg-rose-600 text-white rounded-tr-none" 
                            : "bg-slate-900/90 border border-white/5 text-slate-200 rounded-tl-none whitespace-pre-line"
                        }`}>
                          {m.content}
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-slate-900/90 border border-white/5 text-slate-400 rounded-tl-none flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick options */}
                  <div className="px-4 py-2 bg-slate-950/70 border-t border-white/5 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none flex-shrink-0">
                    <button 
                      onClick={() => triggerQuickQuestion("Am I eligible to donate blood?")}
                      className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider bg-white/[0.02] hover:bg-rose-950/20 border border-white/5 hover:border-rose-900 rounded-full text-slate-450 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      Eligibility Check
                    </button>
                    <button 
                      onClick={() => triggerQuickQuestion("What are the blood compatibility rules?")}
                      className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider bg-white/[0.02] hover:bg-rose-950/20 border border-white/5 hover:border-rose-900 rounded-full text-slate-450 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      Compatibility Rules
                    </button>
                    <button 
                      onClick={() => triggerQuickQuestion("What are rare blood groups?")}
                      className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider bg-white/[0.02] hover:bg-rose-950/20 border border-white/5 hover:border-rose-900 rounded-full text-slate-450 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      Rare Finder
                    </button>
                  </div>

                  {/* Input control */}
                  <div className="p-3 bg-slate-900/90 border-t border-white/5 flex items-center gap-2 flex-shrink-0">
                    <button 
                      onClick={startVoiceInput}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                        isListening ? "bg-red-500/20 text-red-500 animate-pulse border border-red-500/30" : "hover:bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-transparent"
                      }`}
                      title={isListening ? "Listening... click to stop" : "Speak to search"}
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                    
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder={isListening ? "Listening..." : "Type your query here..."}
                      className="flex-1 bg-slate-950/60 border border-white/5 rounded-xl py-2.5 px-3.5 text-xs text-slate-100 placeholder-slate-550 focus:outline-none focus:border-rose-500/50 transition-all"
                      disabled={isListening}
                    />

                    <button
                      onClick={() => handleSendMessage()}
                      className="p-2.5 bg-gradient-to-tr from-red-650 to-rose-600 hover:from-red-550 hover:to-rose-500 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-rose-600/20"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
