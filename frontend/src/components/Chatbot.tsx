import React, { useState, useRef, useEffect } from "react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Scroll to bottom
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, showSettings]);

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
        // Automatically submit the transcript
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

    // Add user message
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");

    try {
      // Fetch AI response
      const reply = await api.chatbotQuery(text);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again." }]);
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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 select-none">
      {/* Floating Toggle Icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-rose-600 hover:bg-rose-500 text-white rounded-full p-3.5 sm:p-4 shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center border border-rose-500/20 shadow-rose-600/30 cursor-pointer"
        >
          <MessageSquare size={22} className="sm:hidden" />
          <MessageSquare size={24} className="hidden sm:block" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-[380px] h-[480px] sm:h-[520px] max-h-[calc(100vh-6rem)] glass-panel rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-800 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 to-rose-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-white/10 p-1.5 rounded-lg">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">AI Bank Assistant</h3>
                <p className="text-[10px] text-rose-200 leading-none">
                  {localStorage.getItem("gemini_api_key") ? "Online • Live Gemini API" : "Online • Local Fallback"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`text-white/80 hover:text-white transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-white/10 ${showSettings ? "bg-white/10 text-white" : ""}`}
                title="Chatbot Settings"
              >
                <Settings size={18} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {showSettings ? (
            <div className="flex-1 p-5 bg-slate-950/95 flex flex-col justify-between text-xs text-slate-300">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Key size={16} className="text-rose-500" />
                  <h4 className="font-bold text-slate-100 text-sm">Gemini API Configuration</h4>
                </div>
                
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Provide your Gemini API key to enable live, production-grade responses powered by <strong>Gemini 1.5 Flash</strong>. Without a key, the chatbot will run on a local rules-based simulation.
                </p>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 font-mono"
                  />
                </div>

                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <AlertCircle size={13} className="text-rose-400" />
                    <span className="font-bold text-[10px] uppercase tracking-wider text-slate-300">Privacy & Security</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Your key is stored strictly on your local browser's storage and is only passed via HTTPS to your locally-hosted backend API.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 border-t border-slate-800 pt-4">
                <button
                  onClick={() => {
                    if (apiKey.trim()) {
                      localStorage.setItem("gemini_api_key", apiKey.trim());
                    } else {
                      localStorage.removeItem("gemini_api_key");
                    }
                    setShowSettings(false);
                  }}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-lg font-semibold text-center transition-colors cursor-pointer shadow-md shadow-rose-600/20"
                >
                  Save Configuration
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("gemini_api_key");
                    setApiKey("");
                    setShowSettings(false);
                  }}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Clear Key
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/80">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                      m.role === "user" 
                        ? "bg-rose-600 text-white rounded-tr-none" 
                        : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line"
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick options */}
              <div className="px-4 py-2 bg-slate-950 border-t border-slate-900 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
                <button 
                  onClick={() => triggerQuickQuestion("Am I eligible to donate blood?")}
                  className="px-2.5 py-1 text-[10px] bg-slate-900 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900 rounded-full text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                >
                  Eligibility Check
                </button>
                <button 
                  onClick={() => triggerQuickQuestion("What are the blood compatibility rules?")}
                  className="px-2.5 py-1 text-[10px] bg-slate-900 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900 rounded-full text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                >
                  Compatibility Rules
                </button>
                <button 
                  onClick={() => triggerQuickQuestion("What are rare blood groups?")}
                  className="px-2.5 py-1 text-[10px] bg-slate-900 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900 rounded-full text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                >
                  Rare Finder
                </button>
              </div>

              {/* Input control */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                <button 
                  onClick={startVoiceInput}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
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
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                  disabled={isListening}
                />

                <button
                  onClick={() => handleSendMessage()}
                  className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
