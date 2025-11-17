import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee, Lead, Role, UserSession, LeadStatus, Designation, EmployeeStatus, Feedback } from '../types';

interface CRMContextType {
  user: UserSession | null;
  leads: Lead[];
  employees: Employee[];
  login: (id: string, pass: string) => Promise<boolean>;
  logout: () => void;
  
  // Employee Actions
  addEmployee: (emp: Omit<Employee, 'id' | 'createdAt' | 'status'>) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  toggleEmployeeStatus: (id: string) => void;

  // Lead Actions
  addLeads: (newLeads: Omit<Lead, 'id' | 'status' | 'assignedTo' | 'feedbacks' | 'createdAt' | 'updatedAt'>[]) => void;
  assignLeads: (leadIds: string[], employeeId: string | null) => void;
  deleteLead: (id: string) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  recordCall: (leadId: string) => void;
  addFeedback: (leadId: string, text: string) => void;
  updateFeedback: (leadId: string, feedbackId: string, newText: string) => void;
  deleteFeedback: (leadId: string, feedbackId: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

// Mock Initial Data
const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'EMP001',
    name: 'John Doe',
    number: '555-0101',
    email: 'john@crm.com',
    address: '123 Main St',
    designation: Designation.CALLER,
    password: 'password',
    status: EmployeeStatus.WORKING,
    createdAt: Date.now(),
  },
];

const MOCK_LEADS: Lead[] = [
  {
    id: 'L001',
    name: 'Alice Smith',
    number: '555-1111',
    location: 'New York',
    status: LeadStatus.NEW,
    assignedTo: 'EMP001',
    feedbacks: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'L002',
    name: 'Bob Jones',
    number: '555-2222',
    location: 'California',
    status: LeadStatus.INTERESTED,
    assignedTo: null,
    feedbacks: [{ id: 'f1', text: 'Liked the property view', timestamp: Date.now() }],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  }
];

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);

  // Simulating persistent storage
  useEffect(() => {
    const storedUser = localStorage.getItem('crm_user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = async (id: string, pass: string): Promise<boolean> => {
    // Admin Check
    if (id === 'admin' && pass === '12345') {
      const session = { id: 'admin', name: 'Administrator', role: Role.ADMIN };
      setUser(session);
      localStorage.setItem('crm_user', JSON.stringify(session));
      return true;
    }

    // Employee Check
    const emp = employees.find(e => e.id === id && e.password === pass);
    if (emp) {
      const session = { id: emp.id, name: emp.name, role: Role.EMPLOYEE };
      setUser(session);
      localStorage.setItem('crm_user', JSON.stringify(session));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crm_user');
  };

  // --- Employee Management ---

  const addEmployee = (data: Omit<Employee, 'id' | 'createdAt' | 'status'>) => {
    const newId = `EMP${String(employees.length + 1).padStart(3, '0')}`;
    const newEmp: Employee = {
      ...data,
      id: newId,
      status: EmployeeStatus.WORKING,
      createdAt: Date.now(),
    };
    setEmployees([...employees, newEmp]);
  };

  const updateEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    // Unassign leads from deleted employee
    setLeads(prev => prev.map(l => l.assignedTo === id ? { ...l, assignedTo: null } : l));
  };

  const toggleEmployeeStatus = (id: string) => {
    setEmployees(prev => prev.map(e => {
      if (e.id === id) {
        return { ...e, status: e.status === EmployeeStatus.WORKING ? EmployeeStatus.LEAVE : EmployeeStatus.WORKING };
      }
      return e;
    }));
  };

  // --- Lead Management ---

  const addLeads = (newLeadsRaw: Omit<Lead, 'id' | 'status' | 'assignedTo' | 'feedbacks' | 'createdAt' | 'updatedAt'>[]) => {
    const timestamp = Date.now();
    const processedLeads: Lead[] = newLeadsRaw.map((l, idx) => ({
      ...l,
      id: `L${timestamp}-${idx}`,
      status: LeadStatus.NEW,
      assignedTo: null,
      feedbacks: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }));
    setLeads(prev => [...processedLeads, ...prev]); // Newest first
  };

  const assignLeads = (leadIds: string[], employeeId: string | null) => {
    setLeads(prev => prev.map(l => leadIds.includes(l.id) ? { ...l, assignedTo: employeeId, updatedAt: Date.now() } : l));
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const updateLeadStatus = (id: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status, updatedAt: Date.now() } : l));
  };

  const recordCall = (leadId: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return { ...l, lastCalledAt: Date.now(), updatedAt: Date.now() };
      }
      return l;
    }));
  };

  const addFeedback = (leadId: string, text: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        if (l.feedbacks.length >= 3) return l; // Limit 3 per spec
        const newFeedback: Feedback = { id: Date.now().toString(), text, timestamp: Date.now() };
        return { ...l, feedbacks: [...l.feedbacks, newFeedback], updatedAt: Date.now() };
      }
      return l;
    }));
  };

  const updateFeedback = (leadId: string, feedbackId: string, newText: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          feedbacks: l.feedbacks.map(f => f.id === feedbackId ? { ...f, text: newText } : f),
          updatedAt: Date.now()
        };
      }
      return l;
    }));
  };

  const deleteFeedback = (leadId: string, feedbackId: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          feedbacks: l.feedbacks.filter(f => f.id !== feedbackId),
          updatedAt: Date.now()
        };
      }
      return l;
    }));
  };

  return (
    <CRMContext.Provider value={{
      user, leads, employees, login, logout,
      addEmployee, updateEmployee, deleteEmployee, toggleEmployeeStatus,
      addLeads, assignLeads, deleteLead, updateLeadStatus, recordCall, addFeedback,
      updateFeedback, deleteFeedback
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within a CRMProvider');
  return context;
};