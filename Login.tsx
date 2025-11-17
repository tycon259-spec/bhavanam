import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Building2, Lock, User, Loader, ShieldCheck, Headset } from 'lucide-react';
import { Role } from '../types';

export const Login: React.FC = () => {
  const { login, user: currentUser } = useCRM();
  const [activeTab, setActiveTab] = useState<'employee' | 'admin'>('employee');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear inputs when switching tabs
  const handleTabChange = (tab: 'employee' | 'admin') => {
    setActiveTab(tab);
    setId('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Attempt login
      const success = await login(id, password);
      
      // We need to verify if the logged-in user matches the selected tab
      if (success) {
        const storedUser = localStorage.getItem('crm_user');
        if (storedUser) {
          const session = JSON.parse(storedUser);
          
          if (activeTab === 'admin' && session.role !== Role.ADMIN) {
            setError('Access Denied: You are not an Admin.');
            localStorage.removeItem('crm_user'); // Force logout
            window.location.reload(); // Reset state
            return;
          }
          
          if (activeTab === 'employee' && session.role !== Role.EMPLOYEE) {
             setError('Access Denied: Please use the Admin Login tab.');
             localStorage.removeItem('crm_user'); // Force logout
             window.location.reload(); // Reset state
             return;
          }
        }
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const isEmployee = activeTab === 'employee';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header Section */}
        <div className={`${isEmployee ? 'bg-blue-600' : 'bg-slate-800'} p-8 text-center transition-colors duration-300`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4 shadow-lg backdrop-blur-sm">
            <Building2 className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">EstateCRM Pro</h1>
          <p className={`${isEmployee ? 'text-blue-100' : 'text-slate-300'} text-sm mt-1 font-medium`}>
            {isEmployee ? 'Employee Portal' : 'Administration Console'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => handleTabChange('employee')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors relative
              ${isEmployee ? 'text-blue-600 bg-white' : 'text-gray-500 bg-gray-50 hover:bg-gray-100'}
            `}
          >
            <Headset size={18} />
            Employee Login
            {isEmployee && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
          <button
            onClick={() => handleTabChange('admin')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors relative
              ${!isEmployee ? 'text-slate-800 bg-white' : 'text-gray-500 bg-gray-50 hover:bg-gray-100'}
            `}
          >
            <ShieldCheck size={18} />
            Admin Login
            {!isEmployee && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800" />}
          </button>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100 flex items-center justify-center gap-2 animate-pulse">
                <Lock size={14} /> {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {isEmployee ? 'Employee ID' : 'Admin Username'}
              </label>
              <div className="relative group">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${isEmployee ? 'text-blue-300 group-focus-within:text-blue-500' : 'text-gray-400 group-focus-within:text-slate-600'}`} size={20} />
                <input 
                  type="text"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all outline-none
                    ${isEmployee 
                      ? 'border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500' 
                      : 'border-gray-200 focus:ring-2 focus:ring-slate-100 focus:border-slate-600'}
                  `}
                  placeholder={isEmployee ? "e.g., EMP001" : "e.g., admin"}
                  value={id}
                  onChange={e => setId(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative group">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${isEmployee ? 'text-blue-300 group-focus-within:text-blue-500' : 'text-gray-400 group-focus-within:text-slate-600'}`} size={20} />
                <input 
                  type="password"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all outline-none
                    ${isEmployee 
                      ? 'border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500' 
                      : 'border-gray-200 focus:ring-2 focus:ring-slate-100 focus:border-slate-600'}
                  `}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-white shadow-md hover:shadow-lg transform active:scale-[0.99] transition-all flex items-center justify-center
                ${isEmployee 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-slate-800 hover:bg-slate-900'}
              `}
            >
              {loading ? <Loader className="animate-spin" size={20} /> : (isEmployee ? 'Login to Dashboard' : 'Access Admin Panel')}
            </button>
          </form>

          <div className="mt-8 text-center space-y-2">
             {isEmployee ? (
               <p className="text-xs text-gray-400">
                 Forgot your Employee ID? Contact your administrator.
               </p>
             ) : (
               <p className="text-xs text-gray-400">
                 Authorized personnel only.
               </p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};