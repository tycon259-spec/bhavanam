import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { LeadStatus, Lead, EmployeeStatus } from '../../types';
import { Search, Calendar, User, X, MessageSquare, Clock, MapPin, ArrowUpDown, PhoneOutgoing } from 'lucide-react';
import { format } from 'date-fns';

export const AllData: React.FC = () => {
  const { leads, employees } = useCRM();
  
  const [dateFilter, setDateFilter] = useState<string>('');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  // Modal State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Filter Logic
  const filteredLeads = useMemo(() => {
    let result = leads.filter(l => {
      // Employee Filter
      let matchesEmp = true;
      if (employeeFilter === 'all') {
        matchesEmp = true;
      } else if (employeeFilter === 'unassigned') {
        matchesEmp = l.assignedTo === null;
      } else if (employeeFilter === 'on_leave') {
        const assignedEmp = employees.find(e => e.id === l.assignedTo);
        matchesEmp = assignedEmp?.status === EmployeeStatus.LEAVE;
      } else {
        matchesEmp = l.assignedTo === employeeFilter;
      }
      
      // Date Filter (Matches UpdatedAt)
      let matchesDate = true;
      if (dateFilter) {
        const leadDate = format(l.updatedAt, 'yyyy-MM-dd');
        matchesDate = leadDate === dateFilter;
      }

      // General Search (Name)
      const matchesSearch = searchQuery === '' || l.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesEmp && matchesDate && matchesSearch;
    });

    // Sort Logic
    return result.sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.createdAt - a.createdAt;
      } else {
        return a.createdAt - b.createdAt;
      }
    });
  }, [leads, employees, employeeFilter, dateFilter, searchQuery, sortOrder]);

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      {/* Filters Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">All Data Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sort Order */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Sort by Creation</label>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select 
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50 appearance-none cursor-pointer"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Filter by Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="date" 
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Employee Filter */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Filter by Employee</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select 
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50 appearance-none cursor-pointer"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
              >
                <option value="all">All Employees</option>
                <option value="unassigned">Unassigned</option>
                <option value="on_leave" className="text-red-600 font-medium">⚠ Assigned to 'On Leave'</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Name Search */}
           <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Search Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Customer name..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col border border-gray-100">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
              <tr>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Last Call</th>
                <th className="p-4 font-semibold">Assigned To</th>
                <th className="p-4 font-semibold text-right">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                    No records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => {
                  const emp = employees.find(e => e.id === lead.assignedTo);
                  const empIsOnLeave = emp?.status === EmployeeStatus.LEAVE;
                  
                  return (
                    <tr key={lead.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="p-4">
                        <button 
                          onClick={() => setSelectedLead(lead)}
                          className="text-left group-hover:translate-x-1 transition-transform duration-200"
                        >
                          <div className="font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-2">
                            {lead.name}
                            <MessageSquare size={14} className="opacity-0 group-hover:opacity-100 text-gray-400" />
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{lead.number}</div>
                        </button>
                      </td>
                      <td className="p-4 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-gray-400" />
                          {lead.location}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                          ${lead.status === LeadStatus.NEW ? 'bg-blue-100 text-blue-800' : 
                            lead.status === LeadStatus.INTERESTED ? 'bg-green-100 text-green-800' : 
                            lead.status === LeadStatus.NOT_INTERESTED ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {lead.lastCalledAt ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            <PhoneOutgoing size={14} className="text-blue-400" />
                            <div>
                              <div>{format(lead.lastCalledAt, 'MMM d, yyyy')}</div>
                              <div className="text-gray-400">{format(lead.lastCalledAt, 'h:mm a')}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs italic">Never</span>
                        )}
                      </td>
                      <td className="p-4">
                        {emp ? (
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${empIsOnLeave ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                              {emp.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-700 leading-tight">{emp.name}</span>
                                {empIsOnLeave && <span className="text-[10px] text-red-500 font-bold">ON LEAVE</span>}
                            </div>
                          </div>
                        ) : (
                          <span className="text-orange-400 text-xs italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4 text-right text-gray-500 font-mono text-xs">
                        {format(lead.createdAt, 'yyyy-MM-dd')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 text-right">
          Total Records: {filteredLeads.length}
        </div>
      </div>

      {/* Feedback History Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform scale-100">
            {/* Modal Header */}
            <div className="bg-slate-900 p-6 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{selectedLead.name}</h3>
                <div className="flex gap-3 text-slate-300 text-sm">
                   <span className="flex items-center gap-1"><MapPin size={14} /> {selectedLead.location}</span>
                   <span className="flex items-center gap-1 opacity-75">|</span>
                   <span className="text-blue-300">{selectedLead.number}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                <MessageSquare size={16} /> Feedback History
              </h4>
              
              <div className="space-y-4">
                {selectedLead.feedbacks && selectedLead.feedbacks.length > 0 ? (
                  selectedLead.feedbacks
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((fb, index) => (
                    <div key={fb.id} className="relative pl-6 pb-1 group">
                      {/* Timeline line */}
                      {index !== selectedLead.feedbacks.length - 1 && (
                        <div className="absolute left-[11px] top-3 bottom-[-16px] w-0.5 bg-gray-200 group-last:hidden"></div>
                      )}
                      
                      {/* Dot */}
                      <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center z-10">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>

                      {/* Content */}
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <p className="text-gray-800 text-sm leading-relaxed mb-3">{fb.text}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-400 font-medium border-t border-gray-50 pt-2">
                          <div className="flex items-center gap-1.5 text-blue-500">
                            <Calendar size={12} />
                            {format(fb.timestamp, 'MMMM d, yyyy')}
                          </div>
                          <div className="hidden sm:block text-gray-300">•</div>
                          <div className="flex items-center gap-1.5 text-orange-500">
                            <Clock size={12} />
                            {format(fb.timestamp, 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 px-6 bg-white rounded-xl border border-dashed border-gray-300">
                    <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No feedback recorded</p>
                    <p className="text-xs text-gray-400 mt-1">This lead hasn't received any feedback updates yet.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 bg-white border-t text-center">
              <button 
                onClick={() => setSelectedLead(null)}
                className="text-sm text-gray-500 hover:text-gray-800 font-medium"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};