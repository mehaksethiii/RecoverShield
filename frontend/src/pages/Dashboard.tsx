import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, ShieldCheck, IndianRupee, PlayCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Revenue Recovery</h1>
          <p className="text-slate-500 mt-1">AI-powered autonomous revenue protection.</p>
        </div>
        <button onClick={simulateFailure} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2">
          <PlayCircle size={18} />
          Demo: Trigger Failure
        </button>
      </header>

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
