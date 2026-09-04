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
      const response = await axios.post('http://localhost:3001/api/copilot', { query: userMsg });
      setChat(prev => [...prev, { sender: 'bot', text: response.data.response }]);
    } catch (e) {
      setChat(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error connecting to the brain.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Merchant Copilot</h1>
        <p className="text-slate-500 mt-1">Natural language insights into your revenue leakage.</p>
      </header>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {chat.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-2 rounded-full h-fit ${msg.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                {msg.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex gap-4">
               <div className="p-2 rounded-full h-fit bg-purple-100 text-purple-600">
                 <Bot size={20} />
               </div>
               <div className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-500 rounded-tl-none italic text-sm">
                 Thinking...
               </div>
             </div>
          )}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="e.g. What is my biggest recoverable revenue source?"
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
