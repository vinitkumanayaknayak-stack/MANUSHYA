
export enum PatientStatus {
  STABLE = 'Stable',
  OBSERVATION = 'Observation',
  CRITICAL = 'Critical'
}

export enum UserRole {
  DOCTOR = 'Doctor',
  NURSE = 'Nurse'
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  wardName: string;
  bedNumber: string;
  assignedDoctor: string;
  status: PatientStatus;
  lastDoctorVisitTime: number; // timestamp
  admissionDate: number; // timestamp
  reportUrl?: string;
  aiPriorityExplanation?: string; // AI generated explanation of priority
  aiOverview?: {
    summary: string;
    priorityReason: string;
    monitoringSuggestion: string;
  };
}

export interface Vitals {
  id: string;
  patientId: string;
  bloodPressure: string;
  spO2: number;
  pulse: number;
  timestamp: number;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorName: string;
  visitNotes: string;
  timestamp: number;
  aiSummary?: {
    summary: string;
    priorityReason: string;
    monitoringSuggestion: string;
  };
}

export interface Notification {
  id: string;
  patientId: string;
  patientName: string;
  message: string;
  aiAlertReason?: string; // AI generated explanation for the alert
  type: 'CRITICAL' | 'OVERDUE';
  timestamp: number;
  read: boolean;
}
