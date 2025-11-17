import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import * as XLSX from 'xlsx';
import { Download, Upload, FileCheck, AlertTriangle } from 'lucide-react';

export const UploadLeads: React.FC = () => {
  const { addLeads } = useCRM();
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { name: 'John Doe', number: '1234567890', location: 'New York' },
      { name: 'Jane Smith', number: '9876543210', location: 'London' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, "leads_template.xlsx");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus('idle');
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadStatus('processing');
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      const validLeads = jsonData
        .filter((row: any) => row.name && row.number && row.location)
        .map((row: any) => ({
          name: String(row.name),
          number: String(row.number),
          location: String(row.location)
        }));

      if (validLeads.length === 0) {
        setUploadStatus('error');
        setMessage('No valid rows found. Check columns: name, number, location.');
        return;
      }

      addLeads(validLeads);
      setUploadStatus('success');
      setMessage(`Successfully uploaded ${validLeads.length} leads.`);
      setFile(null);
    } catch (error) {
      console.error(error);
      setUploadStatus('error');
      setMessage('Failed to parse file. Ensure it is a valid Excel file.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Bulk Upload Leads</h2>
        
        <div className="mb-6">
          <button 
            onClick={downloadTemplate}
            className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <Download size={18} /> Download Excel Template
          </button>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
           <input 
             type="file" 
             id="file-upload"
             className="hidden" 
             accept=".xlsx, .xls" 
             onChange={handleFileChange}
           />
           <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
              {file ? (
                <FileCheck className="text-green-500" size={48} />
              ) : (
                <Upload className="text-gray-400" size={48} />
              )}
              <span className="text-gray-600 font-medium">
                {file ? file.name : 'Click to select or drag Excel file'}
              </span>
              <span className="text-xs text-gray-400">Supported: .xlsx, .xls</span>
           </label>
        </div>

        {uploadStatus === 'error' && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
            <AlertTriangle size={18} /> {message}
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="mt-4 p-3 bg-green-50 text-green-600 rounded-lg flex items-center gap-2 text-sm">
            <FileCheck size={18} /> {message}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleUpload}
            disabled={!file || uploadStatus === 'processing'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadStatus === 'processing' ? 'Uploading...' : 'Upload Data'}
          </button>
        </div>
      </div>
    </div>
  );
};
