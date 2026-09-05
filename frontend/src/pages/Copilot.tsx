import { useState } from 'react';
import axios from 'axios';
import { Send, Bot, User } from 'lucide-react';

export default function Copilot() {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<{sender: 'user' | 'bot', text: string}[]>([
    { sender: 'bot', text: 'Hello! I am your RazorShield Copilot. Ask me about your revenue risks, recovery performance, or recent failures.' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    
    const userMsg = query;
    setQuery('');
    setChat(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/copilot`, { query: userMsg });
      setChat(prev => [...prev, { sender: 'bot', text: response.data.response }]);
    } catch (e) {
      setChat(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error connecting to the brain.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col min-h-[85vh]">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Merchant Copilot</h1>
        <p className="text-slate-400 mt-1">Natural language insights into your revenue leakage.</p>
      </header>

      <div className="flex-1 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
          {chat.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-2.5 rounded-full h-fit flex-shrink-0 border shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-900 text-cyan-400 border-slate-800'}`}>
                {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`px-5 py-3.5 rounded-2xl max-w-[80%] border shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white border-blue-600 rounded-tr-none' 
                  : 'bg-white border-slate-200 text-slate-900 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap text-[14px] leading-relaxed font-normal text-slate-900">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex gap-4">
               <div className="p-2.5 rounded-full h-fit flex-shrink-0 border bg-slate-900 text-cyan-400 border-slate-800 shadow-sm">
                 <Bot size={18} />
               </div>
               <div className="px-5 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 rounded-tl-none flex items-center gap-2 shadow-sm">
                 <span className="text-xs font-semibold text-slate-600 mr-1">AI Reasoning...</span>
                 <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
             </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="e.g. What is my biggest recoverable revenue source?"
              className="flex-1 px-5 py-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-950 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white px-5 py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center justify-center font-semibold"
            >
              <Send size={18} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
