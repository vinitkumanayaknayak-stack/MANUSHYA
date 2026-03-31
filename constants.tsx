
import React from 'react';
import { 
  Users, 
  Activity, 
  UserPlus, 
  Bell, 
  LogOut, 
  Search, 
  AlertCircle,
  Clock,
  ClipboardList,
  ChevronRight,
  TrendingUp,
  FileText,
  Stethoscope,
  LayoutDashboard,
  Map,
  Thermometer
} from 'lucide-react';

export const APP_NAME = "Manushya";

export const COLORS = {
  status: {
    Stable: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Observation: 'bg-amber-50 text-amber-700 border-amber-200',
    Critical: 'bg-rose-50 text-rose-700 border-rose-200 ring-2 ring-rose-500/20'
  }
};

export const ICONS = {
  Patients: <Users size={18} />,
  Vitals: <Activity size={18} />,
  Add: <UserPlus size={18} />,
  Notifications: <Bell size={18} />,
  Logout: <LogOut size={18} />,
  Search: <Search size={18} />,
  Critical: <AlertCircle size={18} />,
  Clock: <Clock size={18} />,
  History: <ClipboardList size={18} />,
  Detail: <ChevronRight size={18} />,
  Chart: <TrendingUp size={18} />,
  Report: <FileText size={18} />,
  Doctor: <Stethoscope size={18} />,
  Nurse: <Thermometer size={18} />,
  Dashboard: <LayoutDashboard size={18} />,
  Ward: <Map size={18} />
};
