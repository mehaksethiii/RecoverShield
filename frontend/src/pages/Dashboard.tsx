import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, ShieldCheck, IndianRupee, PlayCircle, Zap, Cpu, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Shield3D from '../components/Shield3D';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  const simulateFailure = async () => {
    const payload = {
      event: 'payment.failed',
      payload: {
        payment: {
          entity: {
            id: 'pay_' + Math.random().toString(36).substring(7),
            order_id: 'order_' + Math.random().toString(36).substring(7),
            amount: Math.floor(Math.random() * 50000) + 5000,
            currency: 'INR',
            method: 'upi',
            error_description: 'UPI transaction timeout'
          }
        }
      }
    };
    await axios.post('http://localhost:3001/webhooks/razorpay', payload);
    fetchData();
  };

  if (!data) return <div>Loading...</div>;

  const mockChartData = [
    { name: 'Mon', recovered: 4000, risk: 2400 },
    { name: 'Tue', recovered: 3000, risk: 1398 },
    { name: 'Wed', recovered: 2000, risk: 9800 },
    { name: 'Thu', recovered: 2780, risk: 3908 },
    { name: 'Fri', recovered: 1890, risk: 4800 },
    { name: 'Sat', recovered: 2390, risk: 3800 },
    { name: 'Sun', recovered: 3490, risk: 4300 },
  ];

  return (
    <div>
      <header className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Razorpay Test Mode Connected
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300 flex items-center gap-1">
              <Sparkles size={12} />
              Gemini 3.1 + Groq Active
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">RazorShield Revenue Operations</h1>
          <p className="text-slate-500 text-sm">Autonomous payment drops diagnosis, bounded retries & policy-gated recovery.</p>
        </div>
        <button onClick={simulateFailure} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 px-5 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all transform active:scale-95">
          <PlayCircle size={18} />
          Simulate Payment Failure
        </button>
      </header>

      {/* 3D Holographic Defense Hub */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-2xl p-6 mb-8 text-white shadow-xl border border-slate-700/50 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center overflow-hidden relative">
        <div className="lg:col-span-7 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-mono mb-3">
            <Cpu size={14} className="text-blue-400" />
            3D AUTONOMOUS RECOVERY AGENT
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2 text-white">
            Real-Time Telemetry & Guardrail Shield
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-5 max-w-xl">
            RazorShield continuously monitors incoming payment drops. The interactive 3D core below reacts dynamically to webhook anomalies, routing failed transactions through multi-model AI reasoning before executing bounded Razorpay recovery links.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-medium">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700">
              <Zap size={14} className="text-amber-400" />
              <span>Multi-Model AI Redundancy: <strong>Gemini + Groq</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Policy Gates: <strong>100% Enforced</strong></span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 h-64 flex items-center justify-center relative">
          <Shield3D hasActiveRisks={data.activeRisks > 0} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg"><AlertCircle size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Active Risks</p>
            <h2 className="text-2xl font-bold text-slate-900">{data.activeRisks}</h2>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><IndianRupee size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Revenue at Risk</p>
            <h2 className="text-2xl font-bold text-slate-900">₹{(data.totalRisk / 100).toLocaleString()}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg"><IndianRupee size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Recovered</p>
            <h2 className="text-2xl font-bold text-slate-900">₹{(data.recovered / 100).toLocaleString()}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ShieldCheck size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Actions Blocked by Policy</p>
            <h2 className="text-2xl font-bold text-slate-900">{data.blockedActions}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Recovery Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip />
                  <Line type="monotone" dataKey="recovered" stroke="#16a34a" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><PlayCircle size={18} className="text-blue-500"/> Live Pipeline Activity</h3>
            {data.risks.length > 0 ? (
               <div className="flex justify-between items-center bg-slate-900 p-6 rounded-lg text-white">
                  <div className="flex flex-col items-center">
                     <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mb-2 animate-pulse">1</div>
                     <span className="text-xs font-bold">Detected</span>
                  </div>
                  <div className="h-1 w-full bg-slate-700 mx-2"></div>
                  <div className="flex flex-col items-center">
                     <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center mb-2 animate-pulse">2</div>
                     <span className="text-xs font-bold">AI Diagnosis</span>
                  </div>
                  <div className="h-1 w-full bg-slate-700 mx-2"></div>
                  <div className="flex flex-col items-center">
                     <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${data.risks[0].status === 'ESCALATED' ? 'bg-red-500' : 'bg-amber-500'} animate-pulse`}>3</div>
                     <span className="text-xs font-bold text-center w-20 leading-tight">Policy Gate</span>
                  </div>
                  <div className="h-1 w-full bg-slate-700 mx-2"></div>
                  <div className="flex flex-col items-center">
                     <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${data.risks[0].status === 'RECOVERED' ? 'bg-green-500' : 'bg-slate-700'}`}>4</div>
                     <span className="text-xs font-bold">Executed</span>
                  </div>
               </div>
            ) : (
               <p className="text-sm text-slate-500">Awaiting webhook events...</p>
            )}
          </div>
        </div>

        <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Risks</h3>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {data.risks.length === 0 ? (
              <p className="text-slate-500 text-sm">No risks detected yet.</p>
            ) : (
              data.risks.slice(0, 8).map((risk: any) => (
                <div key={risk.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg border border-slate-50">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Failed Payment</p>
                    <p className="text-xs text-slate-500 truncate w-32">{risk.failureReason || 'Unknown error'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">₹{(risk.amount / 100).toLocaleString()}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${risk.status === 'RECOVERED' ? 'bg-green-100 text-green-700' : risk.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {risk.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
