import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck, Activity, BarChart3, MessageSquare, List, Sparkles } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Recovery Operations', path: '/', icon: <Activity size={18} /> },
    { name: 'Batch Simulator', path: '/simulation', icon: <BarChart3 size={18} /> },
    { name: 'Policy Guardrails', path: '/policies', icon: <ShieldCheck size={18} /> },
    { name: 'Audit Telemetry', path: '/audit', icon: <List size={18} /> },
    { name: 'AI Copilot', path: '/copilot', icon: <MessageSquare size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0B0F19]/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col h-screen sticky top-0 z-30">
        <div className="p-6 border-b border-slate-800/60">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="text-cyan-400 w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent block">
                RecoverShield
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 block font-semibold">
                AI Recovery Agent
              </span>
            </div>
          </Link>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ENGINE ACTIVE
            </span>
            <span className="bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60 text-[10px]">
              v2.4
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 text-sm">
          <div className="px-3 pb-2 text-[10px] font-mono tracking-wider text-slate-500 uppercase font-semibold">
            Agent Modules
          </div>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Razorpay & Multi-model indicator */}
        <div className="p-4 m-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-[11px] font-mono">INTELLIGENCE</span>
            <Sparkles size={13} className="text-cyan-400" />
          </div>
          <div className="text-[12px] font-semibold text-slate-200">
            Gemini 3.1 + Groq LPU
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Bounded Razorpay Test Mode
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto px-6 py-8 lg:px-10 lg:py-8 bg-gradient-to-b from-[#030712] via-[#050B18] to-[#030712]">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
