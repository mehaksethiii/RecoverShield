import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, ShieldAlert, CheckCircle } from 'lucide-react';

export default function Policies() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [savedMessage, setSavedMessage] = useState('');

  const fetchPolicies = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/policies');
      setPolicies(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const savePolicy = async (ruleType: string, conditionValue: string, action: string, isActive: boolean) => {
    try {
      await axios.post('http://localhost:3001/api/policies', { ruleType, conditionValue, action, isActive });
      await fetchPolicies();
      setSavedMessage(`Guardrail ${ruleType} saved successfully!`);
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Policy Guardrails</h1>
          <p className="text-slate-400 mt-1">Configure deterministic rules that override AI decisions.</p>
        </div>
        {savedMessage && (
          <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg text-sm font-medium animate-fade-in">
            <CheckCircle size={16} />
            {savedMessage}
          </div>
        )}
      </header>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><ShieldAlert size={18} className="text-red-500"/> High Value Threshold</h3>
             <p className="text-sm text-slate-500">Block or escalate transactions above this amount automatically.</p>
           </div>
           <div className="flex items-center gap-4">
             <input type="number" defaultValue="100000" id="highVal" className="border px-3 py-1 rounded text-slate-900 bg-white" />
             <select id="highAction" className="border px-3 py-1 rounded text-slate-900 bg-white" defaultValue="REQUIRE_HUMAN">
                <option value="REQUIRE_HUMAN">Require Human Review</option>
                <option value="BLOCK">Block Completely</option>
             </select>
             <button onClick={() => {
                const val = (document.getElementById('highVal') as HTMLInputElement).value;
                const act = (document.getElementById('highAction') as HTMLSelectElement).value;
                savePolicy('HIGH_VALUE_THRESHOLD', val, act, true);
             }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded flex items-center gap-2 transition-colors">
                <Save size={16}/> Save
             </button>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><ShieldAlert size={18} className="text-amber-500"/> Max Retry Limits</h3>
             <p className="text-sm text-slate-500">Prevent the AI from spamming users with infinite retry attempts.</p>
           </div>
           <div className="flex items-center gap-4">
             <input type="number" defaultValue="2" id="retryVal" className="border px-3 py-1 rounded w-20 text-slate-900 bg-white" />
             <select id="retryAction" className="border px-3 py-1 rounded text-slate-900 bg-white" defaultValue="BLOCK">
                <option value="BLOCK">Block AI Actions</option>
             </select>
             <button onClick={() => {
                const val = (document.getElementById('retryVal') as HTMLInputElement).value;
                const act = (document.getElementById('retryAction') as HTMLSelectElement).value;
                savePolicy('MAX_RETRY_ATTEMPTS', val, act, true);
             }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded flex items-center gap-2 transition-colors">
                <Save size={16}/> Save
             </button>
           </div>
        </div>

        {policies.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h4 className="font-semibold text-sm text-slate-700 mb-3">Active Enforced Guardrails in Database ({policies.length})</h4>
            <div className="divide-y divide-slate-100">
              {policies.map(p => (
                <div key={p.id} className="py-2.5 flex justify-between items-center text-sm">
                  <span className="font-mono text-slate-800 font-medium">{p.ruleType}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">Threshold: <strong>{p.conditionValue}</strong></span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">{p.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
