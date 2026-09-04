import { useState, useEffect } from 'react';
import axios from 'axios';
import { Play } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Simulation() {
  const [sims, setSims] = useState<any[]>([]);
  const [running, setRunning] = useState(false);

  const fetchSims = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/simulations`);
      setSims(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSims();
  }, []);

  const runSim = async (count: number) => {
    setRunning(true);
    try {
      await axios.post(`${API_URL}/api/simulations`, { count });
      await fetchSims();
    } catch (e) {
      console.error(e);
    }
    setRunning(false);
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Synthetic Batch Simulator</h1>
        <p className="text-slate-400 mt-1">Generate realistic revenue-loss scenarios and evaluate Agent performance.</p>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Run Simulation</h3>
        <div className="flex gap-4">
          <button 
            disabled={running}
            onClick={() => runSim(10)} 
            className="bg-slate-900 hover:bg-slate-800 text-white py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Play size={16} /> Run 10 Events
          </button>
          <button 
            disabled={running}
            onClick={() => runSim(100)} 
            className="bg-slate-900 hover:bg-slate-800 text-white py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Play size={16} /> Run 100 Events
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {sims.map(sim => (
          <div key={sim.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-lg font-bold text-slate-900">{sim.name}</h4>
                <p className="text-sm text-slate-500">{new Date(sim.createdAt).toLocaleString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${sim.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {sim.status}
              </span>
            </div>

            {sim.evaluation && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Baseline Recovery</p>
                  <p className="text-lg font-bold text-slate-900">₹{(sim.evaluation.baselineRecovery / 100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 uppercase font-semibold">AI Recovery</p>
                  <p className="text-lg font-bold text-blue-700">₹{(sim.evaluation.aiRecovery / 100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-green-600 uppercase font-semibold">Incremental</p>
                  <p className="text-lg font-bold text-green-700">+₹{(sim.evaluation.incrementalRevenue / 100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Blocked by Guardrail</p>
                  <p className="text-lg font-bold text-slate-900">{sim.evaluation.blockedActions}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">AI Intervention Rate</p>
                  <p className="text-lg font-bold text-slate-900">{(sim.evaluation.interventionRate * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Recovery Rate</p>
                  <p className="text-lg font-bold text-slate-900">{(sim.evaluation.recoveryRate * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Escalation Rate</p>
                  <p className="text-lg font-bold text-slate-900">{(sim.evaluation.escalationRate * 100).toFixed(1)}%</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
