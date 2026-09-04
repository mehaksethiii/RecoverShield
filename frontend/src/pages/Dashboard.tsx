import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, ShieldCheck, IndianRupee, PlayCircle, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import RecoverShield3DCore from '../components/RecoverShield3DCore';

// ─── Risk Score Gauge (pure SVG, no extra deps) ───────────────────────────────
function RiskGauge({ score, label, color }: { score: number; label: string; color: string }) {
  // score: 0–100. Arc goes from 195deg to 345deg (150deg sweep).
  const radius = 70;
  const cx = 100;
  const cy = 95;
  const startAngle = 195; // degrees
  const endAngle = 345;
  const sweep = endAngle - startAngle; // 150deg
  const fillAngle = startAngle + (sweep * score) / 100;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcPath = (from: number, to: number, r: number) => {
    const x1 = cx + r * Math.cos(toRad(from));
    const y1 = cy + r * Math.sin(toRad(from));
    const x2 = cx + r * Math.cos(toRad(to));
    const y2 = cy + r * Math.sin(toRad(to));
    const large = to - from > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const riskLabel = score >= 75 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'LOW';
  const riskBg = score >= 75 ? '#fef2f2' : score >= 50 ? '#fffbeb' : score >= 25 ? '#eff6ff' : '#f0fdf4';
  const riskText = score >= 75 ? '#dc2626' : score >= 50 ? '#d97706' : score >= 25 ? '#2563eb' : '#16a34a';

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="120" viewBox="0 0 200 120">
        {/* Track */}
        <path d={arcPath(startAngle, endAngle, radius)} fill="none" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" />
        {/* Fill */}
        <path d={arcPath(startAngle, fillAngle, radius)} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }} />
        {/* Score text */}
        <text x={cx} y={cy + 2} textAnchor="middle" fontSize="28" fontWeight="800" fill="#0f172a">{score}</text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="monospace">/ 100</text>
      </svg>
      <div className="text-sm font-bold text-slate-700 -mt-2">{label}</div>
      <div className="mt-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold font-mono" style={{ background: riskBg, color: riskText }}>
        {riskLabel} RISK
      </div>
    </div>
  );
}

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

  const mockStrategyData = [
    { name: 'Smart Retry', value: 45 },
    { name: 'Payment Link', value: 30 },
    { name: 'Alt Route', value: 25 },
  ];
  const PIE_COLORS = ['#0ea5e9', '#8b5cf6', '#10b981'];

  const mockFailureReasons = [
    { name: 'UPI Timeout', count: 120 },
    { name: 'No Funds', count: 85 },
    { name: 'Declined', count: 65 },
    { name: 'Bank Error', count: 40 },
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
          <h1 className="text-3xl font-extrabold text-white mt-2">RazorShield Revenue Operations</h1>
          <p className="text-slate-400 text-sm">Autonomous payment drops diagnosis, bounded retries & policy-gated recovery.</p>
        </div>
        <button onClick={simulateFailure} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 px-5 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all transform active:scale-95">
          <PlayCircle size={18} />
          Simulate Payment Failure
        </button>
      </header>

      {/* 3D Holographic Defense Hub */}
      <div className="mb-8 relative z-10">
          <RecoverShield3DCore 
             activeRisksCount={data.activeRisks} 
             revenueAtRisk={data.totalRisk}
             recoveredAmount={data.recovered}
             onSimulateEvent={simulateFailure}
          />
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

      {/* New Visuals Row: Pie Chart & Bar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Recovery Strategy Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockStrategyData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockStrategyData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Common Failure Reasons</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockFailureReasons} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} width={80} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Risk Score Gauges ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Live Risk Score Monitor</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time AI-computed merchant risk across active dimensions</p>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center bg-slate-50 rounded-xl p-4 border border-slate-100">
            <RiskGauge score={Math.min(99, Math.max(1, data.activeRisks * 3 + 18))} label="Overall Risk" color="#ef4444" />
          </div>
          <div className="flex flex-col items-center bg-slate-50 rounded-xl p-4 border border-slate-100">
            <RiskGauge score={62} label="UPI Failure Rate" color="#f59e0b" />
          </div>
          <div className="flex flex-col items-center bg-slate-50 rounded-xl p-4 border border-slate-100">
            <RiskGauge score={28} label="Card Decline Risk" color="#3b82f6" />
          </div>
          <div className="flex flex-col items-center bg-slate-50 rounded-xl p-4 border border-slate-100">
            <RiskGauge score={15} label="Chargeback Risk" color="#10b981" />
          </div>
        </div>
      </div>
    </div>
  );
}
