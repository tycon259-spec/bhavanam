import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatsCard } from '../../components/StatsCard';
import { Users, Phone, CheckCircle, XCircle, Clock, AlertCircle, Ban } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { LeadStatus, Employee, EmployeeStatus } from '../../types';
import { format } from 'date-fns';

export const AdminDashboard: React.FC = () => {
  const { leads, employees } = useCRM();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Filter Logic
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      let matchEmployee = true;

      if (selectedEmployee === 'all') {
        matchEmployee = true;
      } else if (selectedEmployee === 'on_leave') {
        const assignedEmp = employees.find(e => e.id === lead.assignedTo);
        matchEmployee = assignedEmp?.status === EmployeeStatus.LEAVE;
      } else {
        matchEmployee = lead.assignedTo === selectedEmployee;
      }

      // Simple date match on UpdatedAt or CreatedAt
      const leadDate = format(new Date(lead.updatedAt), 'yyyy-MM-dd');
      const matchDate = dateFilter ? leadDate === dateFilter : true;
      
      return matchEmployee && matchDate;
    });
  }, [leads, employees, selectedEmployee, dateFilter]);

  // Stats Calculation
  const stats = useMemo(() => {
    return {
      total: filteredLeads.length,
      connected: filteredLeads.filter(l => l.status === LeadStatus.CONNECTED).length,
      interested: filteredLeads.filter(l => l.status === LeadStatus.INTERESTED).length,
      notInterested: filteredLeads.filter(l => l.status === LeadStatus.NOT_INTERESTED).length,
      callBack: filteredLeads.filter(l => l.status === LeadStatus.CALL_BACK).length,
      notConnected: filteredLeads.filter(l => l.status === LeadStatus.NOT_CONNECTED).length,
      invalid: filteredLeads.filter(l => l.status === LeadStatus.INVALID).length,
    };
  }, [filteredLeads]);

  // Chart Data
  const chartData = [
    { name: 'Interested', value: stats.interested, color: '#22c55e' },
    { name: 'Connected', value: stats.connected, color: '#3b82f6' },
    { name: 'Call Back', value: stats.callBack, color: '#f59e0b' },
    { name: 'Not Int.', value: stats.notInterested, color: '#ef4444' },
    { name: 'Not Conn.', value: stats.notConnected, color: '#94a3b8' },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            className="border rounded-lg p-2 text-sm flex-1 md:w-48"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="all">All Employees</option>
            <option value="on_leave" className="text-red-600 font-medium">⚠ Assigned to 'On Leave'</option>
            {employees.map(e => (
              <option key={e.id} value={e.id}>{e.name} ({e.status})</option>
            ))}
          </select>
          <input 
            type="date" 
            className="border rounded-lg p-2 text-sm"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Leads" value={stats.total} icon={Users} color="gray" />
        <StatsCard title="Connected" value={stats.connected} icon={CheckCircle} color="blue" />
        <StatsCard title="Interested" value={stats.interested} icon={Phone} color="green" />
        <StatsCard title="Not Interested" value={stats.notInterested} icon={XCircle} color="red" />
        <StatsCard title="Call Back" value={stats.callBack} icon={Clock} color="yellow" />
        <StatsCard title="Not Connected" value={stats.notConnected} icon={AlertCircle} color="purple" />
        <StatsCard title="Invalid" value={stats.invalid} icon={Ban} color="gray" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Lead Status Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={chartData.filter(d => d.value > 0)}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip />
                 <Legend />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};