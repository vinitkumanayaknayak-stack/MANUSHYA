
import React, { useMemo, useState } from 'react';
import { Patient, UserRole, PatientStatus } from '../types';
import { ICONS, COLORS } from '../constants';
import { formatDistanceToNow } from 'date-fns';

interface DashboardProps {
  patients: Patient[];
  role: UserRole;
  currentUser: string;
  onSelectPatient: (id: string) => void;
  onAddPatient: () => void;
  onExplainPriority: (id: string) => void;
  explainingId: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  patients, 
  role, 
  currentUser, 
  onSelectPatient,
  onAddPatient,
  onExplainPriority,
  explainingId
}) => {
  const [search, setSearch] = useState('');

  const filteredPatients = useMemo(() => {
    let list = [...patients];
    if (role === UserRole.DOCTOR) {
      list = list.filter(p => p.assignedDoctor === currentUser);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(s) || 
        p.id.toLowerCase().includes(s) ||
        p.bedNumber.toLowerCase().includes(s)
      );
    }
    return list.sort((a, b) => {
      if (a.status === PatientStatus.CRITICAL && b.status !== PatientStatus.CRITICAL) return -1;
      if (a.status !== PatientStatus.CRITICAL && b.status === PatientStatus.CRITICAL) return 1;
      return a.lastDoctorVisitTime - b.lastDoctorVisitTime;
    });
  }, [patients, role, currentUser, search]);

  const stats = {
    total: filteredPatients.length,
    critical: filteredPatients.filter(p => p.status === PatientStatus.CRITICAL).length,
    observation: filteredPatients.filter(p => p.status === PatientStatus.OBSERVATION).length,
    stable: filteredPatients.filter(p => p.status === PatientStatus.STABLE).length
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {role === UserRole.DOCTOR ? 'Doctor Ward Rounds' : 'Clinical Ward Command'}
          </h2>
          <p className="text-slate-500 mt-1 font-bold text-sm tracking-tight">
            {role === UserRole.DOCTOR 
              ? `Reviewing ${stats.total} patients under your care. Prioritizing emergent cases.`
              : `Real-time management of ward capacity and patient stability.`
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              {ICONS.Search}
            </span>
            <input 
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-72 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm font-medium"
            />
          </div>
          {role === UserRole.NURSE && (
            <button 
              onClick={onAddPatient}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-2xl hover:bg-slate-800 font-black transition-all shadow-xl shadow-slate-900/10 active:scale-95 text-sm uppercase tracking-wider"
            >
              {ICONS.Add}
              <span>Admit</span>
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tracked', value: stats.total, color: 'bg-slate-900', icon: ICONS.Patients, sub: 'Active census' },
          { label: 'Critical Alert', value: stats.critical, color: 'bg-rose-600', icon: ICONS.Critical, sub: 'Needs attention', alert: stats.critical > 0 },
          { label: 'Observation', value: stats.observation, color: 'bg-amber-500', icon: ICONS.Clock, sub: 'Monitor vitals' },
          { label: 'Stable', value: stats.stable, color: 'bg-emerald-600', icon: ICONS.Vitals, sub: 'Recovering' },
        ].map((stat, i) => (
          <div key={i} className={`relative bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300 ${stat.alert ? 'ring-4 ring-rose-500/10 border-rose-100' : ''}`}>
             <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className={`text-4xl font-black mt-2 tracking-tighter ${stat.alert ? 'text-rose-600' : 'text-slate-900'}`}>{stat.value}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">{stat.sub}</p>
                </div>
                <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg ${stat.alert ? 'animate-bounce' : 'group-hover:scale-110 transition-transform'}`}>
                  {stat.icon}
                </div>
             </div>
             {stat.alert && <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 animate-pulse" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Full Profile</th>
                <th className="px-8 py-5">Location</th>
                <th className="px-8 py-5">Rounding Delta</th>
                <th className="px-8 py-5">Health Status</th>
                <th className="px-8 py-5 text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length > 0 ? filteredPatients.map((patient) => (
                <React.Fragment key={patient.id}>
                  <tr 
                    className={`group transition-all cursor-pointer ${patient.status === PatientStatus.CRITICAL ? 'bg-rose-50/20' : 'hover:bg-slate-50'}`}
                    onClick={() => onSelectPatient(patient.id)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-lg transition-all group-hover:rotate-6 ${patient.status === PatientStatus.CRITICAL ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`}>
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-base tracking-tight leading-none">{patient.name}</p>
                          <p className="text-xs font-bold text-slate-400 mt-1.5 uppercase tracking-wide">#{patient.id} • {patient.age}y</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-700">Bed {patient.bedNumber}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{patient.wardName} Unit</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${Date.now() - patient.lastDoctorVisitTime > 6 * 3600000 ? 'text-rose-600 bg-rose-50 shadow-inner' : 'text-slate-400 bg-slate-100'}`}>
                          {ICONS.Clock}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700">{formatDistanceToNow(patient.lastDoctorVisitTime)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black border uppercase tracking-widest transition-all ${COLORS.status[patient.status]} ${patient.status === PatientStatus.CRITICAL ? 'animate-pulse ring-4 ring-rose-500/10' : ''}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onExplainPriority(patient.id);
                        }}
                        className={`inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 ${explainingId === patient.id ? 'opacity-50 animate-pulse' : ''}`}
                      >
                        {explainingId === patient.id ? 'Analyzing...' : 'Explain Priority'}
                      </button>
                      <button className="inline-flex items-center gap-2 bg-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        {ICONS.Detail}
                      </button>
                    </td>
                  </tr>
                  {patient.aiPriorityExplanation && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={5} className="px-8 py-4 border-l-4 border-slate-900">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 text-slate-400">{ICONS.Report}</div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Priority Reason</p>
                            <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                              {patient.aiPriorityExplanation}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                       <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                         {ICONS.Patients}
                       </div>
                       <div>
                        <p className="text-xl font-black text-slate-900 tracking-tight leading-none">No active patients</p>
                        <p className="text-sm font-bold text-slate-400 mt-2">Adjust your search or filters to locate patient records.</p>
                       </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
