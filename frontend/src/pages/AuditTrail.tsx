import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Brain, User, Settings, CheckCircle2, XCircle } from 'lucide-react';

export default function AuditTrail() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/audit');
        setLogs(response.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (actor: string, eventType: string) => {
    if (eventType.includes('SUCCESS')) return <CheckCircle2 className="text-green-500" size={20} />;
    if (eventType.includes('FAIL') || eventType.includes('BLOCK')) return <XCircle className="text-red-500" size={20} />;
    if (actor === 'AI') return <Brain className="text-purple-500" size={20} />;
    if (actor === 'HUMAN') return <User className="text-blue-500" size={20} />;
    return <Settings className="text-slate-500" size={20} />;
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Audit Trail</h1>
        <p className="text-slate-500 mt-1">Immutable record of every AI decision, policy check, and execution.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6">
          <div className="space-y-6">
            {logs.map(log => (
              <div key={log.id} className="flex gap-4 items-start">
                <div className="mt-1 bg-slate-50 p-2 rounded-full border border-slate-100">
                  {getIcon(log.actor, log.eventType)}
                </div>
                <div className="flex-1 pb-6 border-b border-slate-100 last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900">{log.eventType}</span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{log.details}</p>
                  <div className="mt-2 text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded inline-block">
                    Risk ID: {log.riskId || 'N/A'} | Actor: {log.actor}
                  </div>
                </div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-slate-500">No audit logs found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
