
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Patient, 
  Vitals, 
  Visit, 
  UserRole, 
  PatientStatus, 
  Notification 
} from './types';
import { ICONS, APP_NAME } from './constants';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PatientDetail from './components/PatientDetail';
import PatientForm from './components/PatientForm';
import VitalsForm from './components/VitalsForm';
import NotificationCenter from './components/NotificationCenter';

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'P-001',
    name: 'John Doe',
    age: 65,
    wardName: 'Cardiology',
    bedNumber: '12A',
    assignedDoctor: 'Dr. Gregory House',
    status: PatientStatus.STABLE,
    lastDoctorVisitTime: Date.now() - 3600000 * 2,
    admissionDate: Date.now() - 3600000 * 24 * 3
  },
  {
    id: 'P-002',
    name: 'Jane Smith',
    age: 42,
    wardName: 'General',
    bedNumber: '05B',
    assignedDoctor: 'Dr. Gregory House',
    status: PatientStatus.CRITICAL,
    lastDoctorVisitTime: Date.now() - 3600000 * 8,
    admissionDate: Date.now() - 3600000 * 24
  },
  {
    id: 'P-003',
    name: 'Robert Brown',
    age: 78,
    wardName: 'Respiratory',
    bedNumber: '21C',
    assignedDoctor: 'Dr. Wilson',
    status: PatientStatus.OBSERVATION,
    lastDoctorVisitTime: Date.now() - 3600000 * 5,
    admissionDate: Date.now() - 3600000 * 48
  }
];

const INITIAL_VITALS: Vitals[] = [
  {
    id: 'V-001',
    patientId: 'P-001',
    bloodPressure: '120/80',
    spO2: 98,
    pulse: 72,
    timestamp: Date.now() - 3600000
  },
  {
    id: 'V-002',
    patientId: 'P-002',
    bloodPressure: '160/100',
    spO2: 92,
    pulse: 105,
    timestamp: Date.now() - 3600000
  }
];

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.DOCTOR);
  const [currentUser] = useState("Dr. Gregory House");
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [vitals, setVitals] = useState<Vitals[]>(INITIAL_VITALS);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [isAddingVitals, setIsAddingVitals] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [isExplainingPriority, setIsExplainingPriority] = useState<string | null>(null);

  // Centralized System Instruction for Clinical Safety
  const AI_SYSTEM_INSTRUCTION = `You are a clinical decision-support assistant for 'Manushya'.
  Your task is to summarize patient data and workflow status.
  SAFETY RULES:
  1. NEVER provide a medical diagnosis.
  2. NEVER suggest medications or dosages.
  3. NEVER recommend specific treatments.
  4. ONLY summarize data, explain priority reasoning, and suggest monitoring urgency.
  5. Use professional, clinical language.`;

  // Gemini AI Helper
  const generateAI = async (prompt: string, useJson: boolean = false) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const config: any = {
        systemInstruction: AI_SYSTEM_INSTRUCTION,
      };

      if (useJson) {
        config.responseMimeType = "application/json";
        config.responseSchema = {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Plain language summary of status including abnormal vitals highlights." },
            priorityReason: { type: Type.STRING, description: "Detailed reasoning for assigned priority status." },
            monitoringSuggestion: { type: Type.STRING, description: "Urgency suggestion for next review (e.g. review in 1 hour)." }
          },
          required: ["summary", "priorityReason", "monitoringSuggestion"]
        };
      }

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config
      });
      return result.text;
    } catch (e) {
      console.error("AI Generation Error:", e);
      return useJson ? JSON.stringify({ summary: "Unavailable", priorityReason: "Error", monitoringSuggestion: "N/A" }) : "AI analysis unavailable.";
    }
  };

  const updateAIOverview = async (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const patientVitals = vitals.filter(v => v.patientId === patientId).slice(-5);
    const patientVisits = visits.filter(v => v.patientId === patientId).slice(-1);

    const prompt = `Generate a current clinical state overview for patient ${patient.name}.
    Data: Status: ${patient.status}, Bed: ${patient.bedNumber}.
    Recent Vitals History: ${JSON.stringify(patientVitals)}.
    Latest Round Notes: "${patientVisits[0]?.visitNotes || 'No notes yet'}".
    Focus on highlighting any abnormal vitals in plain language and explain why the current priority is appropriate.`;

    const aiResponse = await generateAI(prompt, true);
    try {
      const parsed = JSON.parse(aiResponse || '{}');
      setPatients(prev => prev.map(p => p.id === patientId ? { ...p, aiOverview: parsed } : p));
    } catch (e) {
      console.error("Failed to parse overview JSON", e);
    }
  };

  const updatePatientPriorityExplanation = async (patientId: string) => {
    setIsExplainingPriority(patientId);
    const patient = patients.find(p => p.id === patientId);
    const latestVitals = vitals.filter(v => v.patientId === patientId).pop();
    
    if (!patient) return;

    const prompt = `Provide a professional explanation of why patient ${patient.name} is categorized as ${patient.status}.
    Inputs:
    - Vitals: BP ${latestVitals?.bloodPressure || 'N/A'}, SpO2 ${latestVitals?.spO2 || 'N/A'}%, Pulse ${latestVitals?.pulse || 'N/A'} bpm.
    - Last Doctor Interaction: ${Math.round((Date.now() - patient.lastDoctorVisitTime) / 3600000)}h ago.
    - Admission length: ${Math.round((Date.now() - patient.admissionDate) / 86400000)} days.
    Constraint: Explain based on these metrics only.`;

    const explanation = await generateAI(prompt);
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, aiPriorityExplanation: explanation } : p));
    setIsExplainingPriority(null);
  };

  const generateAlertReason = async (patientId: string, type: 'CRITICAL' | 'OVERDUE') => {
    const patient = patients.find(p => p.id === patientId);
    const latestVitals = vitals.filter(v => v.patientId === patientId).pop();
    if (!patient) return "Error generating reason.";

    const prompt = `Provide a 1-sentence plain-language reason for an alert on patient ${patient.name}. 
    Type: ${type}. Vitals: SpO2 ${latestVitals?.spO2}%, Pulse ${latestVitals?.pulse}. Last check: ${Math.round((Date.now() - patient.lastDoctorVisitTime) / 3600000)}h ago.
    Example output format: "Patient marked Critical due to low SpO2 (91%) and elevated heart rate."`;
    
    return await generateAI(prompt);
  };

  useEffect(() => {
    const checkOverdueVisits = async () => {
      const now = Date.now();
      const overdueThreshold = 6 * 3600000;

      for (const patient of patients) {
        if (role === UserRole.DOCTOR && patient.assignedDoctor !== currentUser) continue;
        const timeSinceVisit = now - patient.lastDoctorVisitTime;
        if (timeSinceVisit > overdueThreshold) {
          const id = `notif-overdue-${patient.id}`;
          if (!notifications.some(n => n.id === id)) {
            const reason = await generateAlertReason(patient.id, 'OVERDUE');
            const newNotif: Notification = {
              id,
              patientId: patient.id,
              patientName: patient.name,
              message: `Visit overdue for ${patient.name}`,
              aiAlertReason: reason,
              type: 'OVERDUE',
              timestamp: now,
              read: false
            };
            setNotifications(prev => [newNotif, ...prev]);
          }
        }
      }
    };
    const interval = setInterval(checkOverdueVisits, 120000);
    checkOverdueVisits();
    return () => clearInterval(interval);
  }, [patients, notifications, role, currentUser]);

  const addPatient = (newPatient: Omit<Patient, 'id' | 'lastDoctorVisitTime' | 'admissionDate'>) => {
    const patient: Patient = {
      ...newPatient,
      id: `P-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      lastDoctorVisitTime: Date.now(),
      admissionDate: Date.now()
    };
    setPatients(prev => [...prev, patient]);
    setIsAddingPatient(false);
    updateAIOverview(patient.id);
  };

  const updatePatientStatus = useCallback(async (patientId: string, status: PatientStatus) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        if (status === PatientStatus.CRITICAL && p.status !== PatientStatus.CRITICAL) {
          generateAlertReason(p.id, 'CRITICAL').then(reason => {
            const newNotif: Notification = {
              id: `notif-critical-${Date.now()}-${p.id}`,
              patientId: p.id,
              patientName: p.name,
              message: `${p.name} status escalated to CRITICAL`,
              aiAlertReason: reason,
              type: 'CRITICAL',
              timestamp: Date.now(),
              read: false
            };
            setNotifications(n => [newNotif, ...n]);
          });
        }
        return { ...p, status, aiPriorityExplanation: undefined };
      }
      return p;
    }));
    updateAIOverview(patientId);
  }, [patients, vitals]);

  const logVitals = (data: Omit<Vitals, 'id' | 'timestamp'>) => {
    const newVital: Vitals = {
      ...data,
      id: `V-${Date.now()}`,
      timestamp: Date.now()
    };
    setVitals(prev => [...prev, newVital]);
    setIsAddingVitals(null);

    const isAbnormal = data.spO2 < 92 || data.pulse > 130 || data.pulse < 45;
    const isNormal = data.spO2 >= 95 && data.pulse >= 60 && data.pulse <= 100;

    if (isAbnormal) {
      updatePatientStatus(data.patientId, PatientStatus.CRITICAL);
    } else if (isNormal) {
      const targetPatient = patients.find(p => p.id === data.patientId);
      if (targetPatient && targetPatient.status !== PatientStatus.STABLE) {
        updatePatientStatus(data.patientId, PatientStatus.STABLE);
      }
    }
    updateAIOverview(data.patientId);
  };

  const logVisit = async (patientId: string, notes: string) => {
    const visitId = `VS-${Date.now()}`;
    const newVisit: Visit = {
      id: visitId,
      patientId,
      doctorName: currentUser,
      visitNotes: notes,
      timestamp: Date.now()
    };
    setVisits(prev => [...prev, newVisit]);
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, lastDoctorVisitTime: Date.now() } : p));
    setNotifications(prev => prev.filter(n => !(n.patientId === patientId && n.type === 'OVERDUE')));

    // Combined Task: Update Patient State Overview
    updateAIOverview(patientId);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const selectedPatient = useMemo(() => 
    patients.find(p => p.id === selectedPatientId), 
    [patients, selectedPatientId]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        role={role} 
        setRole={setRole} 
        userName={currentUser} 
        notificationCount={notifications.filter(n => !n.read).length}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
      />

      <main className="flex-1 container mx-auto px-4 py-8 relative">
        {showNotifications && (
          <NotificationCenter 
            notifications={notifications}
            onRead={markNotificationRead}
            onClose={() => setShowNotifications(false)}
            onSelectPatient={(id) => {
              setSelectedPatientId(id);
              setShowNotifications(false);
            }}
          />
        )}

        {selectedPatient ? (
          <PatientDetail 
            patient={selectedPatient}
            vitals={vitals.filter(v => v.patientId === selectedPatient.id)}
            visits={visits.filter(v => v.patientId === selectedPatient.id)}
            role={role}
            onBack={() => setSelectedPatientId(null)}
            onUpdateStatus={updatePatientStatus}
            onLogVisit={logVisit}
            onAddVitals={() => setIsAddingVitals(selectedPatient.id)}
          />
        ) : isAddingPatient ? (
          <PatientForm 
            onSave={addPatient} 
            onCancel={() => setIsAddingPatient(false)} 
            doctors={Array.from(new Set(patients.map(p => p.assignedDoctor)))}
          />
        ) : (
          <Dashboard 
            patients={patients}
            role={role}
            currentUser={currentUser}
            onSelectPatient={setSelectedPatientId}
            onAddPatient={() => setIsAddingPatient(true)}
            onExplainPriority={updatePatientPriorityExplanation}
            explainingId={isExplainingPriority}
          />
        )}

        {isAddingVitals && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <VitalsForm 
              patientId={isAddingVitals}
              patientName={patients.find(p => p.id === isAddingVitals)?.name || ''}
              onSave={logVitals}
              onCancel={() => setIsAddingVitals(null)}
            />
          </div>
        )}
      </main>

      <footer className="bg-white border-t py-6 text-center text-slate-400 text-[10px] font-bold tracking-widest uppercase">
        <p>&copy; 2024 {APP_NAME}. AI Decision Support is strictly for operational workflow assistance. Final clinical judgment required.</p>
      </footer>
    </div>
  );
};

export default App;
