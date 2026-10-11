import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Room, User } from '../../types/index.ts';
import { X, BedDouble, AlertCircle, Check } from 'lucide-react';

interface AllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialStudentId?: string;
}

export const AllocationModal: React.FC<AllocationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialStudentId,
}) => {
  const [students, setStudents] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || '');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedBed, setSelectedBed] = useState<string>('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (initialStudentId) setSelectedStudentId(initialStudentId);
    }
  }, [isOpen, initialStudentId]);

  const loadData = async () => {
    try {
      const [allUsers, allRooms] = await Promise.all([
        api.getUsers(),
        api.getRooms({ availableOnly: 'true' }),
      ]);
      // Students only
      const studentUsers = allUsers.filter((u: any) => u.role === 'student');
      setStudents(studentUsers);
      setRooms(allRooms);
    } catch (err: any) {
      setError(err.message || 'Failed to load rooms and student list');
    }
  };

  const currentRoom = rooms.find((r) => r._id === selectedRoomId);
  const availableBeds = currentRoom?.beds.filter((b) => b.status === 'available') || [];

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedStudentId || !selectedRoomId || !selectedBed) {
      setError('Please select a student, room, and bed.');
      return;
    }

    setLoading(true);
    try {
      await api.allocateBed({
        studentId: selectedStudentId,
        roomId: selectedRoomId,
        bedNumber: selectedBed,
        academicYear,
        remarks: remarks || 'Allocated via administrative panel',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Allocation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Allocate Hostel Bed</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAllocate} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Student */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Student Resident
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            >
              <option value="">-- Choose registered student --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.studentId || s.email}) {s.roomNumber ? `[Current: ${s.roomNumber}]` : '[Unallocated]'}
                </option>
              ))}
            </select>
          </div>

          {/* Select Room */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Available Room ({rooms.length} with open beds)
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => {
                setSelectedRoomId(e.target.value);
                setSelectedBed('');
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            >
              <option value="">-- Choose room with vacant bed --</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.roomNumber} ({r.hostelName}) - {r.type.toUpperCase()} - {r.capacity - r.occupiedBeds} beds free (₹{r.monthlyFee}/mo)
                </option>
              ))}
            </select>
          </div>

          {/* Select Bed */}
          {currentRoom && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Available Bed in Room {currentRoom.roomNumber}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {currentRoom.beds.map((b) => {
                  const isAvailable = b.status === 'available';
                  const isSelected = selectedBed === b.bedNumber;
                  return (
                    <button
                      key={b.bedNumber}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedBed(b.bedNumber)}
                      className={`p-3 rounded-lg border text-xs text-center transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                          : isAvailable
                          ? 'border-slate-200 text-slate-700 hover:border-slate-300'
                          : 'border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                      }`}
                    >
                      <p>{b.bedNumber}</p>
                      <span className="text-[10px] uppercase font-normal block mt-0.5">
                        {b.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Academic Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Quota</label>
              <input
                type="text"
                placeholder="e.g. Merit quota admission"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Submit */}
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
              disabled={loading || !selectedBed}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Allocating...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
