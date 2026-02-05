import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import { getChatResponse } from '../services/gemini';
import { ChatMessage } from '../types';

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi Prachi! I'm here to help you ace NEET 2026. Have a doubt in Physics, Chemistry, or Bio? Just ask!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Prepare history for API
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await getChatResponse(history, userMsg.text);

    const modelMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-teal-600 text-white rounded-full shadow-xl hover:bg-teal-700 transition-all z-50 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        {/* Header */}
        <div className="p-4 bg-teal-600 text-white rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot size={20} />
            <span className="font-semibold">Prachi's NEET Guide</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-teal-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-100 bg-white rounded-b-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a doubt..."
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChat;