import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Room, RoomAllocation } from '../../types/index.ts';
import { X, ArrowRightLeft, AlertCircle } from 'lucide-react';

interface TransferModalProps {
  allocation: RoomAllocation | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ allocation, onClose, onSuccess }) => {
  if (!allocation) return null;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBed, setSelectedBed] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const allRooms = await api.getRooms({ availableOnly: 'true' });
      // Exclude current room
      setRooms(allRooms.filter((r: any) => r._id !== allocation.roomId));
    } catch (e: any) {
      setError(e.message || 'Failed to load candidate rooms');
    }
  };

  const currentRoom = rooms.find((r) => r._id === selectedRoomId);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !selectedBed) {
      setError('Please select a destination room and bed.');
      return;
    }

    setLoading(true);
    try {
      await api.transferBed(allocation._id, {
        newRoomId: selectedRoomId,
        newBedNumber: selectedBed,
        remarks: remarks || 'Transferred by Warden request',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
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
            <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Transfer Student Room</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleTransfer} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <p className="font-semibold text-slate-900">{allocation.studentName}</p>
            <p className="text-slate-500 font-mono mt-0.5">Reg ID: {allocation.studentRegisterNo}</p>
            <div className="mt-2 text-indigo-700 font-semibold">
              Currently in: Room {allocation.roomNumber} ({allocation.bedNumber}) · {allocation.hostelName}
            </div>
          </div>

          {/* New Room */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transfer to Available Room
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
              <option value="">-- Choose destination room --</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.roomNumber} ({r.hostelName}) - {r.type.toUpperCase()} - {r.capacity - r.occupiedBeds} beds available
                </option>
              ))}
            </select>
          </div>

          {/* Destination Bed */}
          {currentRoom && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Destination Bed in {currentRoom.roomNumber}
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

          {/* Transfer Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Transfer Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Health condition ground-floor request or branch mutual transfer"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
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
              disabled={loading || !selectedBed}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Transferring...' : 'Execute Room Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
