import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { User } from '../../types/index.ts';
import { X, Users, AlertCircle } from 'lucide-react';

interface VisitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (visitor: any) => void;
}

export const VisitorModal: React.FC<VisitorModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [idProofType, setIdProofType] = useState('Government ID (Aadhar/Passport)');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(user?.role === 'student' ? user._id : '');
  const [purpose, setPurpose] = useState('');
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (user?.role !== 'student') {
        loadStudents();
      } else {
        setSelectedStudentId(user._id);
      }
    }
  }, [isOpen, user]);

  const loadStudents = async () => {
    try {
      const all = await api.getUsers();
      setStudents(all.filter((u: any) => u.role === 'student'));
    } catch (e: any) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorPhone.trim() || !selectedStudentId || !purpose.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.checkInVisitor({
        visitorName,
        visitorPhone,
        idProofType,
        idProofNumber: idProofNumber || 'N/A',
        studentId: selectedStudentId,
        purpose,
      });
      onSuccess(res.visitor);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to check-in visitor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Register Visitor Check-In</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student selection if not student */}
          {user?.role !== 'student' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Host Student Resident</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                required
              >
                <option value="">-- Select Student Being Visited --</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.studentId || 'No Reg'}) · Room: {s.roomNumber || 'Unallocated'}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500">Host Resident: </span>
              <span className="font-semibold text-slate-900">{user.name}</span>
              <span className="text-slate-500 ml-2">Room: </span>
              <span className="font-mono font-semibold text-indigo-600">{user.roomNumber || 'A-204'}</span>
            </div>
          )}

          {/* Visitor Name & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor Full Name</label>
              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={visitorPhone}
                onChange={(e) => setVisitorPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                required
              />
            </div>
          </div>

          {/* ID Proof Type & Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Identity Proof</label>
              <select
                value={idProofType}
                onChange={(e) => setIdProofType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
              >
                <option value="Government ID (Aadhar/Passport)">Aadhar / Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Institutional Employee Card">Employee ID</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ID Document Number</label>
              <input
                type="text"
                value={idProofNumber}
                onChange={(e) => setIdProofNumber(e.target.value)}
                placeholder="e.g. XXXX-XXXX-1234"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose of Visit</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Family weekend visit / Delivering project materials"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Issuing Pass...' : 'Check-In & Issue Pass'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
