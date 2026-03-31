
import React from 'react';
import { Notification } from '../types';
import { ICONS } from '../constants';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  notifications: Notification[];
  onRead: (id: string) => void;
  onClose: () => void;
  onSelectPatient: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onRead,
  onClose,
  onSelectPatient
}) => {
  return (
    <div className="absolute top-0 right-0 w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-4 duration-200">
      <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
        <h3 className="font-bold text-slate-800">Notifications</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => {
                  onRead(notif.id);
                  onSelectPatient(notif.patientId);
                }}
                className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex gap-3">
                  <div className={`mt-1 p-1.5 rounded-lg ${notif.type === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    {notif.type === 'CRITICAL' ? ICONS.Critical : ICONS.Clock}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${!notif.read ? 'font-bold' : 'font-medium'} text-slate-800`}>
                      {notif.message}
                    </p>
                    {notif.aiAlertReason && (
                      <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                          {ICONS.Report} AI Alert Reason
                        </p>
                        <p className="text-[11px] font-medium text-slate-600 leading-tight">
                          {notif.aiAlertReason}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDistanceToNow(notif.timestamp)} ago
                    </p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">All clear! No alerts currently.</p>
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t text-center">
        <button 
          onClick={onClose}
          className="text-xs font-bold text-blue-600 hover:text-blue-800"
        >
          Dismiss All
        </button>
      </div>
    </div>
  );
};

export default NotificationCenter;
