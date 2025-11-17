import React, { useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { EmployeeStatus, LeadStatus } from '../../types';
import { StatsCard } from '../../components/StatsCard';
import { CheckCircle, Clock, Phone, XCircle, ToggleLeft, ToggleRight, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export const EmployeeDashboard: React.FC = () => {
  const { user, leads, employees, toggleEmployeeStatus } = useCRM();
  
  const currentEmp = employees.find(e => e.id === user?.id);
  const myLeads = useMemo(() => leads.filter(l => l.assignedTo === user?.id), [leads, user]);

  const stats = {
    total: myLeads.length,
    interested: myLeads.filter(l => l.status === LeadStatus.INTERESTED).length,
    connected: myLeads.filter(l => l.status === LeadStatus.CONNECTED).length,
    pending: myLeads.filter(l => l.status === LeadStatus.NEW || l.status === LeadStatus.CALL_BACK).length,
    notInterested: myLeads.filter(l => l.status === LeadStatus.NOT_INTERESTED).length,
  };

  const chartData = [
    { name: 'Conn.', value: stats.connected },
    { name: 'Int.', value: stats.interested },
    { name: 'Not Int.', value: stats.notInterested },
    { name: 'Pending', value: stats.pending },
  ];

  // Collect and sort recent feedback
  const recentFeedbacks = useMemo(() => {
    const allFeedbacks = myLeads.flatMap(lead => 
      lead.feedbacks.map(fb => ({
        ...fb,
        leadName: lead.name,
        leadStatus: lead.status
      }))
    );
    return allFeedbacks.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  }, [myLeads]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Welcome back, {user?.name}</h2>
          <p className="text-gray-500 text-sm">Here is your daily summary.</p>
        </div>
        {currentEmp && (
          <button 
            onClick={() => toggleEmployeeStatus(currentEmp.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-colors ${
              currentEmp.status === EmployeeStatus.WORKING 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            {currentEmp.status === EmployeeStatus.WORKING ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            {currentEmp.status === EmployeeStatus.WORKING ? 'I am Working' : 'On Leave'}
          </button>
        )}
      </div>

      {currentEmp?.status === EmployeeStatus.WORKING ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="My Total Leads" value={stats.total} icon={Phone} color="blue" />
            <StatsCard title="Interested" value={stats.interested} icon={CheckCircle} color="green" />
            <StatsCard title="Pending Calls" value={stats.pending} icon={Clock} color="yellow" />
            <StatsCard title="Not Interested" value={stats.notInterested} icon={XCircle} color="red" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm h-80 lg:col-span-2">
               <h3 className="text-lg font-semibold mb-4">My Performance</h3>
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                   <XAxis dataKey="name" />
                   <Tooltip />
                   <Bar dataKey="value" fill="#6366f1" barSize={40} radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
            </div>

            {/* Recent Feedback List */}
            <div className="bg-white p-6 rounded-xl shadow-sm h-80 overflow-hidden flex flex-col">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare size={20} className="text-purple-500" />
                Recent Feedback
              </h3>
              <div className="overflow-y-auto flex-1 pr-2 space-y-3">
                {recentFeedbacks.length > 0 ? (
                  recentFeedbacks.map((fb) => (
                    <div key={fb.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-gray-700">{fb.leadName}</span>
                        <span className="text-[10px] text-gray-400">{format(fb.timestamp, 'MMM d, h:mm a')}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-snug">"{fb.text}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 mt-10">
                    <p className="text-sm">No feedback recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-xl text-center text-yellow-800">
          <h3 className="text-xl font-bold mb-2">You are currently marked as 'On Leave'</h3>
          <p>Please toggle your status to 'Working' to access calling data and start your day.</p>
        </div>
      )}
    </div>
  );
};