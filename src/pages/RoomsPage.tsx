import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Hostel, Room } from '../types/index.ts';
import {
  Building,
  BedDouble,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  X,
  Filter,
} from 'lucide-react';
import { AllocationModal } from '../components/common/AllocationModal.tsx';

export const RoomsPage: React.FC = () => {
  const { user } = useAuth();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHostelId, setSelectedHostelId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [searchRoom, setSearchRoom] = useState<string>('');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);

  // New room state
  const [newRoomData, setNewRoomData] = useState({
    hostelId: '',
    roomNumber: '',
    floor: 1,
    block: 'Block A',
    type: 'double',
    capacity: 2,
    monthlyFee: 7500,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hList, rList] = await Promise.all([
        api.getHostels(),
        api.getRooms(),
      ]);
      setHostels(hList);
      setRooms(rList);
      if (hList.length > 0 && !newRoomData.hostelId) {
        setNewRoomData((prev) => ({ ...prev, hostelId: hList[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRoom(newRoomData);
      setShowAddRoom(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create room');
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesHostel = selectedHostelId === 'all' || r.hostelId === selectedHostelId;
    const matchesType = selectedType === 'all' || r.type === selectedType;
    const matchesAvail = !onlyAvailable || r.occupiedBeds < r.capacity;
    const matchesSearch = r.roomNumber.toLowerCase().includes(searchRoom.toLowerCase());
    return matchesHostel && matchesType && matchesAvail && matchesSearch;
  });

  const isStaff = user?.role === 'warden' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Hostels, Rooms & Bed Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Module B · Real-time room capacity, bed assignments, and occupancy monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isStaff && (
            <>
              <button
                onClick={() => setShowAllocateModal(true)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <BedDouble className="w-4 h-4" />
                Allocate Bed
              </button>
              <button
                onClick={() => setShowAddRoom(true)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Room
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hostel Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hostels.map((h) => {
          const hRooms = rooms.filter((r) => r.hostelId === h._id);
          const totalBeds = hRooms.reduce((s, r) => s + r.capacity, 0);
          const occupied = hRooms.reduce((s, r) => s + r.occupiedBeds, 0);
          const isSelected = selectedHostelId === h._id;

          return (
            <div
              key={h._id}
              onClick={() => setSelectedHostelId(isSelected ? 'all' : h._id)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {h.code} · {h.type}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">{h.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Warden: {h.wardenName}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Rooms: {hRooms.length}</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {occupied} / {totalBeds} Beds ({totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by room number (e.g. A-204)..."
              value={searchRoom}
              onChange={(e) => setSearchRoom(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg capitalize"
          >
            <option value="all">All Room Types</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
            <option value="quad">Quad</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Show Only Vacant Beds</span>
          </label>

          {selectedHostelId !== 'all' && (
            <button
              onClick={() => setSelectedHostelId('all')}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Clear Hostel Filter
            </button>
          )}
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            Loading room allocations and beds...
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            No rooms found matching your active filters.
          </div>
        ) : (
          filteredRooms.map((room) => {
            const isFull = room.occupiedBeds >= room.capacity;
            const freeBeds = room.capacity - room.occupiedBeds;

            return (
              <div
                key={room._id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-base font-bold font-mono text-slate-900">
                        Room {room.roomNumber}
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {room.block} · Floor {room.floor} · {room.hostelName}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isFull
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {isFull ? 'Fully Occupied' : `${freeBeds} Bed Available`}
                    </span>
                  </div>

                  {/* Bed Matrix */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Bed Allocation ({room.occupiedBeds}/{room.capacity})
                    </p>
                    <div className="space-y-1.5">
                      {room.beds.map((bed) => (
                        <div
                          key={bed.bedNumber}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center justify-between ${
                            bed.status === 'occupied'
                              ? 'bg-slate-50 border-slate-200 text-slate-800'
                              : 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                          }`}
                        >
                          <span className="font-mono font-medium">{bed.bedNumber}</span>
                          <span className="text-[11px] font-semibold truncate max-w-[140px]">
                            {bed.status === 'occupied' ? bed.studentName || 'Occupied' : 'Vacant'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 capitalize">{room.type} room</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    ₹{room.monthlyFee?.toLocaleString()}/mo
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add New Hostel Room</h3>
              <button onClick={() => setShowAddRoom(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hostel Residence</label>
                <select
                  value={newRoomData.hostelId}
                  onChange={(e) => setNewRoomData({ ...newRoomData, hostelId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                >
                  {hostels.map((h) => (
                    <option key={h._id} value={h._id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    placeholder="e.g. A-302"
                    value={newRoomData.roomNumber}
                    onChange={(e) => setNewRoomData({ ...newRoomData, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Floor</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={newRoomData.floor}
                    onChange={(e) => setNewRoomData({ ...newRoomData, floor: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Block Name</label>
                  <input
                    type="text"
                    value={newRoomData.block}
                    onChange={(e) => setNewRoomData({ ...newRoomData, block: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity (Beds)</label>
                  <select
                    value={newRoomData.capacity}
                    onChange={(e) => {
                      const cap = Number(e.target.value);
                      const type = cap === 1 ? 'single' : cap === 2 ? 'double' : cap === 3 ? 'triple' : 'quad';
                      setNewRoomData({ ...newRoomData, capacity: cap, type });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value={1}>1 Bed (Single)</option>
                    <option value={2}>2 Beds (Double)</option>
                    <option value={3}>3 Beds (Triple)</option>
                    <option value={4}>4 Beds (Quad)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Room Tariff (₹)</label>
                <input
                  type="number"
                  value={newRoomData.monthlyFee}
                  onChange={(e) => setNewRoomData({ ...newRoomData, monthlyFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddRoom(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocation Modal */}
      <AllocationModal
        isOpen={showAllocateModal}
        onClose={() => setShowAllocateModal(false)}
        onSuccess={() => {
          setShowAllocateModal(false);
          loadData();
        }}
      />
    </div>
  );
};
