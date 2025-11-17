import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Designation, Employee } from '../../types';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export const EmployeeManager: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, toggleEmployeeStatus } = useCRM();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialForm = {
    name: '', number: '', email: '', address: '', designation: Designation.CALLER, password: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateEmployee(editingId, formData);
    } else {
      addEmployee(formData);
    }
    handleClose();
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleEdit = (emp: Employee) => {
    setFormData({
      name: emp.name, number: emp.number, email: emp.email, address: emp.address, designation: emp.designation, password: emp.password
    });
    setEditingId(emp.id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Employee Management</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} /> Add Employee
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-700 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Password</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono text-blue-600">{emp.id}</td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{emp.name}</div>
                    <div className="text-xs text-gray-400">{emp.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">{emp.designation}</span>
                  </td>
                  <td className="p-4">{emp.number}</td>
                  <td className="p-4 font-mono text-xs">••••••</td>
                  <td className="p-4">
                    <button onClick={() => toggleEmployeeStatus(emp.id)} className="flex items-center gap-1">
                      {emp.status === 'Working' 
                        ? <ToggleRight className="text-green-500" size={24} /> 
                        : <ToggleLeft className="text-gray-400" size={24} />
                      }
                      <span className={emp.status === 'Working' ? 'text-green-600' : 'text-gray-500'}>{emp.status}</span>
                    </button>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleEdit(emp)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Edit2 size={18} /></button>
                    <button onClick={() => deleteEmployee(emp.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Create'} Employee</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Name" className="border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required placeholder="Phone" className="border p-2 rounded" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
              </div>
              <input required type="email" placeholder="Email" className="w-full border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input required placeholder="Address" className="w-full border p-2 rounded" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <select className="border p-2 rounded" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value as Designation})}>
                  {Object.values(Designation).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input required placeholder="Password" type="text" className="border p-2 rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
