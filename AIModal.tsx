import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { X, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { Lead } from '../types';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, lead }) => {
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateScript = async () => {
    setLoading(true);
    setScript(null);
    setCopied(false);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        setScript("Error: API Key is missing in environment variables.");
        setLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        Create a call script for this lead:
        Lead Name: ${lead.name}
        Location: ${lead.location}
        Status: ${lead.status}
        Past Notes: ${lead.feedbacks.map(f => f.text).join(' | ') || "No prior interaction"}
        
        The script should be conversational, acknowledge any past notes if they exist, and aim to move the lead to the next stage (e.g., a meeting or property visit).
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: "You are a top-performing Real Estate Inside Sales Agent (ISA). Write short, punchy, and persuasive scripts (max 75 words). Tone: Professional yet warm.",
          temperature: 0.7,
        }
      });

      setScript(response.text || "No script generated.");
    } catch (error) {
      console.error("AI Generation Error:", error);
      setScript("Failed to generate script. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (script) {
      navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center">
          <div className="flex items-center text-white gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Sparkles size={18} className="text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold leading-tight">AI Script Assistant</h3>
              <p className="text-xs text-indigo-100 opacity-90">Powered by Gemini 2.5</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700">Target Lead</h4>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {lead.status}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="font-medium text-gray-900">{lead.name}</p>
              <p className="text-sm text-gray-500">{lead.location}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
               <h4 className="text-sm font-semibold text-gray-700">Generated Script</h4>
               {script && (
                 <button 
                   onClick={copyToClipboard}
                   className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                 >
                   {copied ? <Check size={14} /> : <Copy size={14} />}
                   {copied ? 'Copied' : 'Copy'}
                 </button>
               )}
            </div>
            
            <div className={`
              relative min-h-[120px] rounded-lg border transition-colors
              ${script ? 'bg-white border-gray-200' : 'bg-slate-50 border-dashed border-gray-300 flex items-center justify-center'}
            `}>
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-600 bg-white/80 z-10">
                  <Loader2 className="animate-spin mb-2" size={24} />
                  <span className="text-xs font-medium animate-pulse">Crafting perfect pitch...</span>
                </div>
              ) : script ? (
                <div className="p-4 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  "{script}"
                </div>
              ) : (
                <div className="text-center p-4">
                  <Sparkles className="mx-auto text-gray-300 mb-2" size={24} />
                  <p className="text-gray-400 text-xs">Click generate to create a custom script.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
             <button 
                onClick={generateScript}
                disabled={loading}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm shadow-sm transition-all
                  ${loading 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-md active:scale-95'}
                `}
             >
               {loading ? 'Generating...' : script ? 'Regenerate Script' : 'Generate Script'}
               {!loading && <Sparkles size={16} />}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};