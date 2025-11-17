import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { LeadStatus } from '../../types';
import { Filter, UserPlus, Trash2, Search, MessageSquare, Edit2, Check, X } from 'lucide-react';
import { format } from 'date-fns';

export const DataAssignment: React.FC = () => {
  const { leads, employees, assignLeads, deleteLead, updateFeedback, deleteFeedback } = useCRM();
  
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [filterEmployee, setFilterEmployee] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [targetEmployee, setTargetEmployee] = useState('');
  
  // Feedback Editing State
  const [editingFeedback, setEditingFeedback] = useState<{ leadId: string, fbId: string, text: string } | null>(null);

  // Filter Logic
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesEmp = filterEmployee === 'all' 
        ? true 
        : filterEmployee === 'unassigned' ? l.assignedTo === null : l.assignedTo === filterEmployee;
      const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
      const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || 
                            l.location.toLowerCase().includes(search.toLowerCase());
      return matchesEmp && matchesStatus && matchesSearch;
    });
  }, [leads, filterEmployee, filterStatus, search]);

  // Selection Handlers
  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedLeads);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedLeads(newSet);
  };

  // Actions
  const handleAssign = () => {
    if (!targetEmployee) return alert('Select an employee to assign');
    assignLeads(Array.from(selectedLeads), targetEmployee === 'unassign' ? null : targetEmployee);
    setSelectedLeads(new Set());
  };

  const handleDelete = () => {
    if (confirm(`Delete ${selectedLeads.size} leads?`)) {
      Array.from(selectedLeads).forEach(id => deleteLead(id));
      setSelectedLeads(new Set());
    }
  };

  const handleUpdateFeedback = () => {
    if (editingFeedback) {
      updateFeedback(editingFeedback.leadId, editingFeedback.fbId, editingFeedback.text);
      setEditingFeedback(null);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Lead Data & Feedback</h2>
          
          {/* Action Bar */}
          <div className="flex gap-2 bg-gray-50 p-2 rounded-lg border">
            <select 
              className="bg-white border rounded px-2 py-1 text-sm"
              value={targetEmployee}
              onChange={(e) => setTargetEmployee(e.target.value)}
            >
              <option value="">Select Action...</option>
              <option value="unassign">Unassign</option>
              {employees.map(e => <option key={e.id} value={e.id}>Assign to {e.name}</option>)}
            </select>
            <button 
              disabled={selectedLeads.size === 0 || !targetEmployee}
              onClick={handleAssign}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              Apply
            </button>
            <button 
              disabled={selectedLeads.size === 0}
              onClick={handleDelete}
              className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center border rounded-lg px-2 bg-white">
             <Search size={16} className="text-gray-400" />
             <input 
               placeholder="Search name/loc..." 
               className="p-2 text-sm outline-none"
               value={search}
               onChange={e => setSearch(e.target.value)}
             />
          </div>
          <select className="border rounded p-2 text-sm" value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
            <option value="all">All Assignment</option>
            <option value="unassigned">Unassigned Only</option>
            {employees.map(e => <option key={e.id} value={e.id}>Assigned to {e.name}</option>)}
          </select>
          <select className="border rounded p-2 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="p-3 w-10">
                  <input type="checkbox" 
                    checked={filteredLeads.length > 0 && selectedLeads.size === filteredLeads.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="p-3">Customer</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned To</th>
                <th className="p-3 text-center w-16">Fb Count</th>
                <th className="p-3 w-80">Feedback History</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLeads.map(lead => {
                const emp = employees.find(e => e.id === lead.assignedTo);
                return (
                  <tr key={lead.id} className={`hover:bg-blue-50 ${selectedLeads.has(lead.id) ? 'bg-blue-50' : ''}`}>
                    <td className="p-3 align-top">
                      <input type="checkbox" checked={selectedLeads.has(lead.id)} onChange={() => toggleSelect(lead.id)} />
                    </td>
                    <td className="p-3 align-top">
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-xs text-gray-500">{lead.number}</div>
                    </td>
                    <td className="p-3 align-top">{lead.location}</td>
                    <td className="p-3 align-top">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                        ${lead.status === LeadStatus.NEW ? 'bg-blue-100 text-blue-800' : 
                          lead.status === LeadStatus.INTERESTED ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-3 align-top text-gray-500">
                      {emp ? emp.name : <span className="text-orange-500 italic">Unassigned</span>}
                    </td>
                    <td className="p-3 align-top text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold ${lead.feedbacks.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                        {lead.feedbacks.length}
                      </span>
                    </td>
                    <td className="p-3 align-top">
                       <div className="space-y-2">
                        {lead.feedbacks && lead.feedbacks.length > 0 ? (
                          lead.feedbacks.map((fb, i) => (
                            <div key={fb.id} className="bg-gray-50 border border-gray-200 p-2 rounded text-xs group relative">
                               {editingFeedback?.fbId === fb.id ? (
                                 <div className="flex flex-col gap-2">
                                    <textarea 
                                      autoFocus
                                      className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-200 outline-none resize-none bg-white"
                                      rows={2}
                                      value={editingFeedback.text}
                                      onChange={(e) => setEditingFeedback({...editingFeedback, text: e.target.value})}
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button 
                                        onClick={handleUpdateFeedback}
                                        className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                        title="Save"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button 
                                        onClick={() => setEditingFeedback(null)}
                                        className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                                        title="Cancel"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                 </div>
                               ) : (
                                 <>
                                   <p className="text-gray-800 mb-1 pr-12 leading-relaxed">{fb.text}</p>
                                   <div className="flex items-center justify-between mt-1">
                                     <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                       <MessageSquare size={8} />
                                       {format(fb.timestamp, 'MMM d, h:mm a')}
                                     </div>
                                     <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50/80 backdrop-blur-sm pl-2">
                                        <button 
                                          onClick={() => setEditingFeedback({ leadId: lead.id, fbId: fb.id, text: fb.text })}
                                          className="p-1 text-blue-500 hover:bg-blue-50 rounded hover:text-blue-600"
                                          title="Edit Feedback"
                                        >
                                          <Edit2 size={12} />
                                        </button>
                                        <button 
                                          onClick={() => {
                                            if(window.confirm('Are you sure you want to delete this feedback?')) {
                                              deleteFeedback(lead.id, fb.id);
                                            }
                                          }}
                                          className="p-1 text-red-500 hover:bg-red-50 rounded hover:text-red-600"
                                          title="Delete Feedback"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                     </div>
                                   </div>
                                 </>
                               )}
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-300 italic">No feedback recorded</span>
                        )}
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-2 bg-gray-50 text-xs text-gray-500 text-right border-t">
          Showing {filteredLeads.length} records
        </div>
      </div>
    </div>
  );
};