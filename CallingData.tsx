import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { LeadStatus, Feedback, EmployeeStatus } from '../../types';
import { Phone, MessageCircle, Send, ChevronDown, ChevronUp, Clock, MapPin, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { AIModal } from '../../components/AIModal';

export const CallingData: React.FC = () => {
  const { user, leads, employees, updateLeadStatus, addFeedback, recordCall } = useCRM();
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [aiModalLead, setAiModalLead] = useState<any>(null);

  const currentEmp = employees.find(e => e.id === user?.id);
  const MAX_CHARS = 150;

  const myLeads = useMemo(() => {
    return leads
      .filter(l => l.assignedTo === user?.id)
      .sort((a, b) => {
        // Priority: New > Call Back > Others
        const score = (s: LeadStatus) => s === LeadStatus.NEW ? 3 : s === LeadStatus.CALL_BACK ? 2 : 1;
        return score(b.status) - score(a.status);
      });
  }, [leads, user]);

  if (currentEmp?.status !== EmployeeStatus.WORKING) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Clock size={48} className="mb-4" />
        <p className="text-xl">Switch status to 'Working' to view leads.</p>
      </div>
    );
  }

  const handleCall = (id: string, number: string) => {
    recordCall(id);
    window.location.href = `tel:${number}`;
  };

  const handleWhatsApp = (number: string) => {
    window.open(`https://wa.me/${number}`, '_blank');
  };

  const submitFeedback = (id: string) => {
    if (!feedbackText.trim()) return;
    addFeedback(id, feedbackText);
    setFeedbackText('');
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setFeedbackText(text);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <h2 className="text-xl font-bold text-gray-800">My Calling List ({myLeads.length})</h2>
      
      {myLeads.map(lead => {
        const isExpanded = expandedLead === lead.id;
        
        return (
          <div key={lead.id} className={`bg-white rounded-xl shadow-sm border transition-all ${isExpanded ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-100'}`}>
            {/* Header Row */}
            <div 
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => {
                setExpandedLead(isExpanded ? null : lead.id);
                setFeedbackText(''); // Clear text when toggling
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <div className="font-bold text-gray-800 text-lg">{lead.name}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin size={14} /> {lead.location}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Quick AI Action */}
                <button
                   onClick={(e) => {
                     e.stopPropagation();
                     setAiModalLead(lead);
                   }}
                   className="hidden sm:flex p-2 text-purple-600 bg-purple-50 rounded-full hover:bg-purple-100 border border-purple-100 transition-colors"
                   title="Generate Script"
                >
                   <Sparkles size={16} />
                </button>

                <span className={`px-3 py-1 rounded-full text-xs font-bold
                  ${lead.status === LeadStatus.NEW ? 'bg-blue-100 text-blue-700' : 
                    lead.status === LeadStatus.INTERESTED ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {lead.status}
                </span>
                {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="p-4 pt-0 border-t border-gray-100 bg-slate-50 rounded-b-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  
                  {/* Left: Actions */}
                  <div className="space-y-4">
                    <div className="flex gap-3">
                       <button 
                         onClick={() => handleCall(lead.id, lead.number)}
                         className="flex-1 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 shadow-sm"
                       >
                         <Phone size={18} /> Call
                       </button>
                       <button 
                         onClick={() => handleWhatsApp(lead.number)}
                         className="flex-1 bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 shadow-sm"
                       >
                         <MessageCircle size={18} /> WhatsApp
                       </button>
                    </div>
                    
                    {/* AI Assistant Button (Main) */}
                    <button
                      onClick={() => setAiModalLead(lead)}
                      className="w-full bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 shadow-sm transition-all"
                    >
                      <Sparkles size={18} className="text-purple-600" /> 
                      <span className="font-medium">Generate AI Script</span>
                    </button>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Update Status</label>
                      <select 
                        className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                      >
                        {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Right: Feedback */}
                  <div className="flex flex-col h-full">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">History & Feedback ({lead.feedbacks.length}/3)</label>
                    <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 mb-3 space-y-3 max-h-40 overflow-y-auto">
                      {lead.feedbacks.length === 0 && (
                         <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                            No feedback history yet.
                         </div>
                      )}
                      {lead.feedbacks.map(f => (
                        <div key={f.id} className="text-sm border-b border-gray-100 last:border-0 pb-2">
                          <p className="text-gray-800 leading-snug">{f.text}</p>
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Clock size={10} />
                            {format(f.timestamp, 'MMM d, h:mm a')}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {lead.feedbacks.length < 3 ? (
                      <div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Add feedback note..."
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                            value={feedbackText}
                            onChange={handleFeedbackChange}
                            onKeyPress={e => e.key === 'Enter' && submitFeedback(lead.id)}
                          />
                          <button 
                            onClick={() => submitFeedback(lead.id)}
                            disabled={!feedbackText.trim()}
                            className="bg-slate-800 text-white px-3 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send size={18} />
                          </button>
                        </div>
                        <div className="flex justify-end mt-1">
                          <span className={`text-[10px] ${feedbackText.length >= MAX_CHARS ? 'text-red-500' : 'text-gray-400'}`}>
                            {feedbackText.length}/{MAX_CHARS}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-red-500 text-center bg-red-50 py-2 rounded">Feedback limit reached (3/3)</p>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {myLeads.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <div className="bg-gray-50 inline-flex p-4 rounded-full mb-4">
             <Phone size={24} className="text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-600">No leads assigned</p>
          <p className="text-sm text-gray-400">Wait for the admin to assign data.</p>
        </div>
      )}

      {aiModalLead && (
        <AIModal 
          isOpen={!!aiModalLead} 
          onClose={() => setAiModalLead(null)} 
          lead={aiModalLead} 
        />
      )}
    </div>
  );
};