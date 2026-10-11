import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { User, BedDouble, Phone, Mail, Building, ShieldCheck, Check } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [year, setYear] = useState(user?.year || '2nd Year');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.updateProfile({ phone, department, year });
      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Resident Student Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personal academic records, campus residency status, and verified contact coordinates.
          </p>
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left card: Resident Badge */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-2xl shadow-xs">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{user.name}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user.studentId || 'No Reg No'}</p>
            <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 mt-2 capitalize">
              {user.role} Resident
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 text-left text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate font-mono">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-mono">{user.phone || 'No phone set'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Building className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{user.hostelName || 'Aryabhatta Residence'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <BedDouble className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-mono font-semibold text-slate-900">
                {user.roomNumber ? `Room ${user.roomNumber}` : 'Not Allocated'}
              </span>
            </div>
          </div>
        </div>

        {/* Right card: Editable fields */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Edit Personal Information</h3>

          {savedSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name (Read-Only)</label>
              <input
                type="text"
                value={user.name}
                disabled
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student Register Number</label>
              <input
                type="text"
                value={user.studentId || ''}
                disabled
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
