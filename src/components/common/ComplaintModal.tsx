import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { X, Wrench, AlertTriangle } from 'lucide-react';
import { MaintenanceCategory, MaintenancePriority } from '../../types/index.ts';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [category, setCategory] = useState<MaintenanceCategory>('electrical');
  const [priority, setPriority] = useState<MaintenancePriority>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [roomNumber, setRoomNumber] = useState(user?.roomNumber || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a complaint title and description.');
      return;
    }

    setLoading(true);
    try {
      await api.createMaintenance({
        category,
        priority,
        title,
        description,
        roomNumber: roomNumber || user?.roomNumber || 'Resident Room',
        hostelName: user?.hostelName || 'Hostel Campus',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint');
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
            <Wrench className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Submit Maintenance Request</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium capitalize"
              >
                <option value="electrical">Electrical (Fan/Light/Switch)</option>
                <option value="plumbing">Plumbing (Tap/Geyser/Drain)</option>
                <option value="wifi">Wi-Fi & Internet</option>
                <option value="carpentry">Carpentry (Bed/Door/Cupboard)</option>
                <option value="cleaning">Housekeeping & Hygiene</option>
                <option value="appliance">Water Cooler / Appliance</option>
                <option value="other">Other Facility</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium capitalize"
              >
                <option value="low">Low (Standard repair)</option>
                <option value="medium">Medium (Requires attention)</option>
                <option value="high">High (Hindering routine)</option>
                <option value="urgent">Urgent (Safety/Leak/Hazard)</option>
              </select>
            </div>
          </div>

          {/* Room Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hostel Room Number</label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. A-204"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-medium"
              required
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Geyser tripping circuit breaker after 2 minutes"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
              required
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the exact location, symptoms, and urgency..."
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
              {loading ? 'Submitting...' : 'Lodge Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
