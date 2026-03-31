
import React from 'react';
import { UserRole } from '../types';
import { ICONS, APP_NAME } from '../constants';

interface NavbarProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  notificationCount: number;
  onToggleNotifications: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  role, 
  setRole, 
  userName, 
  notificationCount, 
  onToggleNotifications 
}) => {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 h-20 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-lg shadow-slate-900/20 active:scale-95 transition-transform cursor-pointer">
          {ICONS.Vitals}
        </div>
        <div className="hidden sm:block">
          <h1 className="font-black text-xl text-slate-900 leading-none tracking-tighter uppercase">{APP_NAME}</h1>
          <p className="text-[10px] text-slate-500 font-black tracking-[0.2em] uppercase mt-1">Clinical Rounding Suite</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Role Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setRole(UserRole.DOCTOR)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              role === UserRole.DOCTOR ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
            }`}
          >
            {ICONS.Doctor}
            <span className="hidden md:inline">Doctor</span>
          </button>
          <button 
            onClick={() => setRole(UserRole.NURSE)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              role === UserRole.NURSE ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
            }`}
          >
            {ICONS.Nurse}
            <span className="hidden md:inline">Nurse</span>
          </button>
        </div>

        <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
          <button 
            onClick={onToggleNotifications}
            className={`relative p-3 rounded-2xl transition-all ${notificationCount > 0 ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            {ICONS.Notifications}
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-4 border-white -mt-1 -mr-1">
                {notificationCount}
              </span>
            )}
          </button>
          
          <div className="hidden lg:block">
            <p className="text-sm font-black text-slate-900 tracking-tight leading-none">{userName}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{role} Profile</p>
          </div>
          
          <button className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-95">
            {ICONS.Logout}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
