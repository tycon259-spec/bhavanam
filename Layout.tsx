import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Role } from '../types';
import { 
  LayoutDashboard, Users, Upload, FileSpreadsheet, 
  LogOut, Menu, X, PhoneCall, Briefcase 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, setActivePage }) => {
  const { user, logout } = useCRM();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'upload', label: 'Bulk Upload', icon: Upload },
    { id: 'assignment', label: 'Assign Data', icon: Briefcase },
    { id: 'alldata', label: 'All Data', icon: FileSpreadsheet },
  ];

  const employeeMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calls', label: 'My Calling Data', icon: PhoneCall },
  ];

  const menuItems = user?.role === Role.ADMIN ? adminMenu : employeeMenu;

  const handleNav = (id: string) => {
    setActivePage(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-auto
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-400">EstateCRM</h1>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-white">
            <X size={24} />
          </button>
        </div>

        <div className="px-6 mb-6">
          <div className="bg-slate-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Welcome,</p>
            <p className="font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-blue-400 uppercase">{user?.role}</p>
          </div>
        </div>

        <nav className="px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activePage === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10 p-4 lg:hidden flex items-center justify-between">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600">
            <Menu size={24} />
          </button>
          <span className="font-semibold text-gray-800">
             {menuItems.find(m => m.id === activePage)?.label}
          </span>
          <div className="w-6"></div> {/* Spacer */}
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
