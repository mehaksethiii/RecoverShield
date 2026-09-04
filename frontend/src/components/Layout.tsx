import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck, Activity, BarChart3, MessageSquare, List } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Activity size={18} /> },
    { name: 'Simulation', path: '/simulation', icon: <BarChart3 size={18} /> },
    { name: 'Guardrails', path: '/policies', icon: <ShieldCheck size={18} /> },
    { name: 'Audit Trail', path: '/audit', icon: <List size={18} /> },
    { name: 'AI Copilot', path: '/copilot', icon: <MessageSquare size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 flex flex-col h-screen sticky top-0">
        <div className="flex items-center gap-2 mb-10 text-xl font-bold">
          <ShieldCheck className="text-blue-400" />
          RazorShield
        </div>
        <nav className="flex flex-col gap-4 text-sm text-slate-300">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
