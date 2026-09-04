import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, ShieldAlert, ToggleLeft, ToggleRight } from 'lucide-react';

export default function Policies() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      await axios.post('http://localhost:3001/api/policies', { ruleType, conditionValue, action, isActive });
      await fetchPolicies();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Policy Guardrails</h1>
          <p className="text-slate-500 mt-1">Configure deterministic rules that override AI decisions.</p>
        </div>
      </header>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <h3 className="font-bold text-lg flex items-center gap-2"><ShieldAlert size={18} className="text-red-500"/> High Value Threshold</h3>
             <p className="text-sm text-slate-500">Block or escalate transactions above this amount automatically.</p>
           </div>
           <div className="flex items-center gap-4">
             <input type="number" defaultValue="100000" id="highVal" className="border px-3 py-1 rounded" />
             <select id="highAction" className="border px-3 py-1 rounded" defaultValue="REQUIRE_HUMAN">
                <option value="REQUIRE_HUMAN">Require Human Review</option>
                <option value="BLOCK">Block Completely</option>
             </select>
             <button onClick={() => {
                const val = (document.getElementById('highVal') as HTMLInputElement).value;
                const act = (document.getElementById('highAction') as HTMLSelectElement).value;
                savePolicy('HIGH_VALUE_THRESHOLD', val, act, true);
             }} className="bg-blue-600 text-white px-4 py-1.5 rounded flex items-center gap-2">
                <Save size={16}/> Save
             </button>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <h3 className="font-bold text-lg flex items-center gap-2"><ShieldAlert size={18} className="text-amber-500"/> Max Retry Limits</h3>
             <p className="text-sm text-slate-500">Prevent the AI from spamming users with infinite retry attempts.</p>
           </div>
           <div className="flex items-center gap-4">
             <input type="number" defaultValue="2" id="retryVal" className="border px-3 py-1 rounded w-20" />
             <select id="retryAction" className="border px-3 py-1 rounded" defaultValue="BLOCK">
                <option value="BLOCK">Block AI Actions</option>
             </select>
             <button onClick={() => {
                const val = (document.getElementById('retryVal') as HTMLInputElement).value;
                const act = (document.getElementById('retryAction') as HTMLSelectElement).value;
                savePolicy('MAX_RETRY_ATTEMPTS', val, act, true);
             }} className="bg-blue-600 text-white px-4 py-1.5 rounded flex items-center gap-2">
                <Save size={16}/> Save
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
