
import React, { useState } from 'react';
import { Patient, Vitals, Visit, UserRole, PatientStatus } from '../types';
import { ICONS, COLORS } from '../constants';
import { format } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface PatientDetailProps {
  patient: Patient;
  vitals: Vitals[];
  visits: Visit[];
  role: UserRole;
  onBack: () => void;
  onUpdateStatus: (id: string, status: PatientStatus) => void;
  onLogVisit: (id: string, notes: string) => void;
  onAddVitals: () => void;
}

const PatientDetail: React.FC<PatientDetailProps> = ({
  patient,
  vitals,
  visits,
  role,
  onBack,
  onUpdateStatus,
  onLogVisit,
  onAddVitals
}) => {
  const [visitNotes, setVisitNotes] = useState('');
  const [showVisitForm, setShowVisitForm] = useState(false);

  const chartData = vitals.map(v => ({
    time: format(v.timestamp, 'HH:mm'),
    spO2: v.spO2,
    pulse: v.pulse
  })).slice(-15);

  const handleSubmitVisit = () => {
    if (!visitNotes.trim()) return;
    onLogVisit(patient.id, visitNotes);
    setVisitNotes('');
    setShowVisitForm(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-bold"
        >
          <div className="p-2 bg-white rounded-xl border border-slate-200 group-hover:bg-slate-50 rotate-180 transition-colors">
            {ICONS.Detail}
          </div>
          <span>Return to Rounds</span>
        </button>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mark Status:</span>
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {Object.values(PatientStatus).map((status) => (
              <button
                key={status}
                disabled={role === UserRole.DOCTOR}
                onClick={() => onUpdateStatus(patient.id, status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  patient.status === status 
                    ? COLORS.status[status] + ' shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                } ${role === UserRole.DOCTOR ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 p-8 overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 -mr-8 -mt-8 ${patient.status === PatientStatus.CRITICAL ? 'text-rose-600' : 'text-blue-600'}`}>
               {ICONS.Vitals}
            </div>
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-black text-white mb-6 shadow-xl ${patient.status === PatientStatus.CRITICAL ? 'bg-rose-500' : 'bg-slate-900'}`}>
                {patient.name.charAt(0)}
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{patient.name}</h3>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                <span>Bed {patient.bedNumber}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>{patient.wardName} Unit</span>
              </div>
            </div>

            <div className="mt-8 space-y-5 border-t border-slate-100 pt-8">
              {[
                { label: 'Patient ID', value: patient.id },
                { label: 'Age / Demographics', value: `${patient.age} Years` },
                { label: 'Primary Physician', value: patient.assignedDoctor },
                { label: 'Admission Date', value: format(patient.admissionDate, 'MMM dd, yyyy') },
                { label: 'Last Physician Round', value: format(patient.lastDoctorVisitTime, 'HH:mm • MMM dd') },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center group">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                  <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* AI DECISION SUPPORT OVERVIEW */}
          {patient.aiOverview ? (
            <section className="bg-indigo-600 text-white rounded-3xl p-8 shadow-xl shadow-indigo-500/30 relative overflow-hidden group border border-indigo-500">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                {ICONS.Report}
              </div>
              <h4 className="font-black flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-indigo-200 mb-6">
                Clinical State Overview (AI)
              </h4>
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-black uppercase text-indigo-300 mb-1 tracking-widest">Summary & Abnormalities</p>
                  <p className="text-sm font-medium leading-relaxed italic">
                    {patient.aiOverview.summary}
                  </p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black uppercase text-indigo-200 mb-1 tracking-widest">Priority Reasoning</p>
                  <p className="text-xs font-medium text-indigo-50 leading-relaxed">
                    {patient.aiOverview.priorityReason}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <div className="p-2 bg-indigo-500 rounded-xl">
                    {ICONS.Clock}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-indigo-200 tracking-widest">Monitoring Suggestion</p>
                    <p className="text-sm font-black text-white">{patient.aiOverview.monitoringSuggestion}</p>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-[8px] text-indigo-300/60 font-black uppercase tracking-widest text-center border-t border-indigo-500/50 pt-4">
                Decision support tool • No Diagnosis
              </p>
            </section>
          ) : (
            <section className="bg-slate-100 rounded-3xl p-8 text-center border-2 border-dashed border-slate-200">
               <div className="animate-pulse flex flex-col items-center">
                 <div className="w-8 h-8 rounded-full bg-slate-200 mb-2" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generating AI Overview...</p>
               </div>
            </section>
          )}

          <section className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl shadow-slate-900/20">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest text-slate-400">
                {ICONS.Vitals} Clinical Baseline
              </h4>
              <button onClick={onAddVitals} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
                {ICONS.Add}
              </button>
            </div>
            {vitals.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SpO2 Level</p>
                  <p className={`text-3xl font-black mt-1 ${vitals[vitals.length - 1].spO2 < 95 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {vitals[vitals.length - 1].spO2}%
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pulse</p>
                    <p className="text-xl font-black mt-1 text-white">{vitals[vitals.length - 1].pulse} <span className="text-xs font-normal text-slate-500">bpm</span></p>
                  </div>
                   <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BP</p>
                    <p className="text-xl font-black mt-1 text-white">{vitals[vitals.length - 1].bloodPressure}</p>
                  </div>
                </div>
                <p className="text-[10px] text-center text-slate-500 mt-2 font-bold italic uppercase">
                  Telemetry Updated: {format(vitals[vitals.length - 1].timestamp, 'HH:mm')}
                </p>
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-white/10 rounded-3xl opacity-50">
                <p className="text-xs font-bold text-slate-400 uppercase">Awaiting Vitals Log</p>
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 p-8">
             <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  {ICONS.Chart} Clinical Monitoring
                </h4>
                <p className="text-sm text-slate-500 font-medium">SpO2 and Pulse rate history over the last 15 entries.</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSpO2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 700, fontSize: '12px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="spO2" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    dot={{ r: 0 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }} 
                    name="SpO2 (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pulse" 
                    stroke="#f43f5e" 
                    strokeWidth={4} 
                    dot={{ r: 0 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }} 
                    name="Pulse (bpm)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h4 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                {ICONS.History} Clinical Round Notes
              </h4>
              {role === UserRole.DOCTOR && !showVisitForm && (
                <button 
                  onClick={() => setShowVisitForm(true)}
                  className="bg-blue-600 text-white text-sm font-black px-6 py-3 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  New Round Note
                </button>
              )}
            </div>

            <div className="p-8">
              {showVisitForm && (
                <div className="mb-8 p-6 bg-blue-50/30 rounded-3xl border border-blue-100 space-y-4 animate-in zoom-in-95 duration-200">
                  <h5 className="font-black text-blue-900 uppercase text-xs tracking-widest">Entry: Current Observation</h5>
                  <textarea 
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    placeholder="Enter detailed clinical findings, updates, or planned interventions..."
                    className="w-full h-32 p-5 bg-white border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-inner placeholder:italic"
                  />
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setShowVisitForm(false)}
                      className="text-slate-500 px-5 py-2 text-sm font-bold hover:text-slate-900 transition-colors"
                    >
                      Discard
                    </button>
                    <button 
                      onClick={handleSubmitVisit}
                      className="bg-slate-900 text-white px-8 py-2.5 rounded-xl text-sm font-black hover:bg-slate-800 transition-all shadow-md active:scale-95"
                    >
                      Publish Note
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-10">
                {visits.length > 0 ? [...visits].reverse().map((visit, idx) => (
                  <div key={visit.id} className="relative pl-10">
                    <div className="absolute left-0 top-0 bottom-[-40px] w-px bg-slate-100 last:hidden" />
                    <div className="absolute left-[-6px] top-1 w-3 h-3 rounded-full border-4 border-white shadow-[0_0_0_2px_#e2e8f0] bg-slate-300" />
                    <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-500">
                            {visit.doctorName.charAt(0)}
                          </div>
                          <span className="font-black text-slate-800 text-sm tracking-tight">{visit.doctorName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] bg-white px-3 py-1 rounded-full border border-slate-100">
                          {format(visit.timestamp, 'HH:mm • MMM dd')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {visit.visitNotes}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-16 opacity-30 text-center">
                    <div className="p-6 bg-slate-100 rounded-full mb-4">{ICONS.History}</div>
                    <p className="font-black text-slate-600 tracking-tight text-lg">Electronic Health Record Empty</p>
                    <p className="text-sm font-medium text-slate-500 mt-1 max-w-[240px]">No historical round data is currently available for this patient.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
