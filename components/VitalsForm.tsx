
import React, { useState } from 'react';
import { Vitals } from '../types';

interface VitalsFormProps {
  patientId: string;
  patientName: string;
  onSave: (vitals: Omit<Vitals, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
}

const VitalsForm: React.FC<VitalsFormProps> = ({ patientId, patientName, onSave, onCancel }) => {
  const [data, setData] = useState({
    bloodPressure: '120/80',
    spO2: 98,
    pulse: 72
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      patientId,
      bloodPressure: data.bloodPressure,
      spO2: data.spO2,
      pulse: data.pulse
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="px-6 py-4 bg-slate-50 border-b">
        <h3 className="font-bold text-slate-800">Log Vitals</h3>
        <p className="text-xs text-slate-500">Patient: {patientName} ({patientId})</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600 uppercase">Blood Pressure (mmHg)</label>
          <input 
            type="text"
            required
            value={data.bloodPressure}
            onChange={(e) => setData(prev => ({ ...prev, bloodPressure: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. 120/80"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">SpO2 (%)</label>
            <input 
              type="number"
              required
              min="0"
              max="100"
              value={data.spO2}
              onChange={(e) => setData(prev => ({ ...prev, spO2: parseInt(e.target.value) }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Pulse (bpm)</label>
            <input 
              type="number"
              required
              min="0"
              max="300"
              value={data.pulse}
              onChange={(e) => setData(prev => ({ ...prev, pulse: parseInt(e.target.value) }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600 uppercase">Upload Report (Optional)</label>
          <input 
            type="file"
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <button 
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Vitals
          </button>
        </div>
      </form>
    </div>
  );
};

export default VitalsForm;
