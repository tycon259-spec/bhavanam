import React, { useState, useEffect } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Role } from './types';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EmployeeManager } from './pages/admin/EmployeeManager';
import { UploadLeads } from './pages/admin/UploadLeads';
import { DataAssignment } from './pages/admin/DataAssignment';
import { AllData } from './pages/admin/AllData';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { CallingData } from './pages/employee/CallingData';

const AppContent: React.FC = () => {
  const { user } = useCRM();
  const [activePage, setActivePage] = useState('dashboard');

  // Reset page on login
  useEffect(() => {
    setActivePage('dashboard');
  }, [user?.role]);

  if (!user) {
    return <Login />;
  }

  const renderAdminPage = () => {
    switch (activePage) {
      case 'dashboard': return <AdminDashboard />;
      case 'employees': return <EmployeeManager />;
      case 'upload': return <UploadLeads />;
      case 'assignment': return <DataAssignment />;
      case 'alldata': return <AllData />;
      default: return <AdminDashboard />;
    }
  };

  const renderEmployeePage = () => {
    switch (activePage) {
      case 'dashboard': return <EmployeeDashboard />;
      case 'calls': return <CallingData />;
      default: return <EmployeeDashboard />;
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {user.role === Role.ADMIN ? renderAdminPage() : renderEmployeePage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <CRMProvider>
      <AppContent />
    </CRMProvider>
  );
};

export default App;