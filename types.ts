export enum Role {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export enum Designation {
  CALLER = 'Caller',
  EDITOR = 'Editor',
  OWNER = 'Owner',
}

export enum LeadStatus {
  NEW = 'New',
  CONNECTED = 'Connected',
  INTERESTED = 'Interested',
  NOT_INTERESTED = 'Not Interested',
  CALL_BACK = 'Call Back',
  NOT_CONNECTED = 'Not Connected',
  INVALID = 'Invalid',
}

export enum EmployeeStatus {
  WORKING = 'Working',
  LEAVE = 'Leave',
}

export interface Feedback {
  id: string;
  text: string;
  timestamp: number;
}

export interface Lead {
  id: string;
  name: string;
  number: string;
  location: string;
  status: LeadStatus;
  assignedTo: string | null; // Employee ID
  feedbacks: Feedback[];
  lastCalledAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Employee {
  id: string; // Auto-generated
  name: string;
  number: string;
  email: string;
  address: string;
  designation: Designation;
  password: string;
  status: EmployeeStatus;
  createdAt: number;
}

export interface UserSession {
  id: string;
  name: string;
  role: Role;
}