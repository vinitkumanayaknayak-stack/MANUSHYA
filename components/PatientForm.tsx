
import React, { useState } from 'react';
import { Patient, PatientStatus } from '../types';

interface PatientFormProps {
  onSave: (patient: Omit<Patient, 'id' | 'lastDoctorVisitTime' | 'admissionDate'>) => void;
  onCancel: () => void;
  doctors: string[];
}

const PatientForm: React.FC<PatientFormProps> = ({ onSave, onCancel, doctors }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    wardName: 'General',
    bedNumber: '',
    assignedDoctor: doctors[0] || 'Dr. Gregory House',
    status: PatientStatus.STABLE
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.bedNumber) return;
    onSave({
      ...formData,
      age: parseInt(formData.age)
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border shadow-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-50 px-8 py-6 border-b">
        <h2 className="text-xl font-bold text-slate-800">Patient Admission Form</h2>
        <p className="text-sm text-slate-500">Enter patient details to assign to ward.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Full Name</label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Robert Johnson"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Age</label>
            <input 
              required
              type="number"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              placeholder="e.g. 45"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Ward Name</label>
            <select 
              value={formData.wardName}
              onChange={(e) => setFormData(prev => ({ ...prev, wardName: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="General">General</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Respiratory">Respiratory</option>
              <option value="ICU">ICU</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Bed Number</label>
            <input 
              required
              type="text"
              value={formData.bedNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, bedNumber: e.target.value }))}
              placeholder="e.g. 15C"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Assigned Doctor</label>
            <select 
              value={formData.assignedDoctor}
              onChange={(e) => setFormData(prev => ({ ...prev, assignedDoctor: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              {doctors.map(doc => <option key={doc} value={doc}>{doc}</option>)}
              {!doctors.includes('Dr. Gregory House') && <option value="Dr. Gregory House">Dr. Gregory House</option>}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Initial Status</label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PatientStatus }))}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              {Object.values(PatientStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-6 border-t flex justify-end gap-3">
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-slate-500 font-bold hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Save Patient
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
