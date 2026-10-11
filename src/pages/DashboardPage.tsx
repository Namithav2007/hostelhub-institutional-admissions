import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { OccupancyStats, RoomAllocation, FeeRecord, MaintenanceRequest, VisitorRecord } from '../types/index.ts';
import {
  Building2,
  Users,
  BedDouble,
  DollarSign,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  UserCheck,
} from 'lucide-react';

interface DashboardPageProps {
  onSelectTab: (tab: string) => void;
  onOpenReceipt: (receiptNumber: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onSelectTab, onOpenReceipt }) => {
  const { user, allocation } = useAuth();
  const [stats, setStats] = useState<OccupancyStats | null>(null);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [occStats, feeList, maintList, visList] = await Promise.all([
        api.getOccupancyStats(),
        api.getFees(),
        api.getMaintenance(),
        api.getVisitors(),
      ]);
      setStats(occStats);
      setFees(feeList);
      setMaintenance(maintList);
      setVisitors(visList);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const role = user.role;

  // Student calculations
  const myPendingFees = fees.filter((f) => f.studentId === user._id && f.balance > 0);
  const totalBalanceDue = myPendingFees.reduce((sum, f) => sum + f.balance, 0);
  const myOpenTickets = maintenance.filter((m) => m.studentId === user._id && m.status !== 'resolved');

  // Admin / Finance calculations
  const totalInvoiced = fees.reduce((sum, f) => sum + f.totalAmount, 0);
  const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalOutstanding = fees.reduce((sum, f) => sum + f.balance, 0);
  const checkedInVisitorsCount = visitors.filter((v) => v.status === 'checked_in').length;
  const pendingMaintCount = maintenance.filter((m) => m.status !== 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Welcome back, {user.name}
            </h1>
            <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              {role}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {role === 'student'
              ? `Resident Portal · ${user.department || 'Engineering'} · Room: ${user.roomNumber || 'Not Allocated'}`
              : role === 'warden'
              ? 'Warden Administration Console · Residence Operations & Resident Safety'
              : role === 'finance'
              ? 'Institutional Hostel Accounts & Fee Collections Directorate'
              : 'Institutional Administrative Dashboard · Operations & Systems Overview'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {role === 'student' ? (
            <button
              onClick={() => onSelectTab('maintenance')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              Lodge Complaint
            </button>
          ) : (
            <button
              onClick={() => onSelectTab('allocations')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <BedDouble className="w-3.5 h-3.5" />
              Manage Allocations
            </button>
          )}
        </div>
      </div>

      {/* High-Level Metric Tiles (Tabular Numerals) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {role === 'student' ? (
          <>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-500 block">Allocated Room</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
                {user.roomNumber || 'Pending'}
              </p>
              <p className="text-xs text-slate-500 mt-1 truncate">
                {user.hostelName || 'No active allocation'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-500 block">Fee Balance Due</span>
              <p className="text-2xl font-bold font-mono text-indigo-700 mt-2 tabular-nums">
                ₹{totalBalanceDue.toLocaleString()}
              </p>
              <button
                onClick={() => onSelectTab('fees')}
                className="text-xs text-indigo-600 hover:underline font-medium mt-1 inline-block"
              >
                View breakdown &rarr;
              </button>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-500 block">Active Complaints</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
                {myOpenTickets.length}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                {myOpenTickets.length === 0 ? 'All resolved' : 'In review / progress'}
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-500 block">Campus Visitors</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
                {visitors.filter((v) => v.studentId === user._id).length}
              </p>
              <button
                onClick={() => onSelectTab('visitors')}
                className="text-xs text-indigo-600 hover:underline font-medium mt-1 inline-block"
              >
                Visitor passes &rarr;
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Total Occupancy</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
                {stats?.occupancyRate || 0}%
              </p>
              <p className="text-xs text-slate-500 mt-1 tabular-nums">
                {stats?.occupiedBeds || 0} / {stats?.totalBeds || 0} beds occupied
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Available Beds</span>
                <BedDouble className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold font-mono text-indigo-600 mt-2 tabular-nums">
                {stats?.availableBeds || 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">Ready for allocation</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Total Collections</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
                ₹{(totalCollected / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-slate-500 mt-1 tabular-nums">
                Pending: ₹{(totalOutstanding / 1000).toFixed(1)}k
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Checked-in Visitors</span>
                <Users className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold font-mono text-amber-600 mt-2 tabular-nums">
                {checkedInVisitorsCount}
              </p>
              <p className="text-xs text-slate-500 mt-1">Currently on premises</p>
            </div>
          </>
        )}
      </div>

      {/* Main Content Split: Role-Specific Detailed Sections */}
      {role === 'student' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room & Residence Details */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Your Residence Summary</h3>
              <button
                onClick={() => onSelectTab('rooms')}
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                Browse Hostels &rarr;
              </button>
            </div>

            {user.roomNumber ? (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden h-40 border border-slate-200">
                  <img
                    src="/src/assets/images/hostel_student_room_1791699522875.jpg"
                    alt="Hostel Room"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent flex items-end p-4">
                    <div className="text-white">
                      <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-mono">
                        Active Residency
                      </span>
                      <h4 className="text-lg font-bold text-white">
                        {user.hostelName || 'Aryabhatta Residence Hall'}
                      </h4>
                      <p className="text-xs text-slate-200 font-mono">Room: {user.roomNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-500 block">Registration:</span>
                    <span className="font-mono font-semibold text-slate-900">{user.studentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Department:</span>
                    <span className="text-slate-800">{user.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Academic Year:</span>
                    <span className="text-slate-800">{user.year || '2nd Year'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm font-medium text-slate-700">No room allocated yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Submit an application under Admissions to request room allocation for the current term.
                </p>
                <button
                  onClick={() => onSelectTab('admissions')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                >
                  Apply for Hostel Admission
                </button>
              </div>
            )}

            {/* Recent Complaints */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recent Maintenance Requests
                </h4>
                <button
                  onClick={() => onSelectTab('maintenance')}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  View All ({myOpenTickets.length})
                </button>
              </div>

              {myOpenTickets.length === 0 ? (
                <p className="text-xs text-slate-500">No pending maintenance complaints.</p>
              ) : (
                <div className="space-y-2">
                  {myOpenTickets.slice(0, 2).map((t) => (
                    <div key={t._id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-800">{t.title}</p>
                        <p className="text-slate-500 font-mono mt-0.5">
                          {t.ticketNumber} · {t.category}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold capitalize bg-amber-50 text-amber-700">
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Fee Billing Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Fee Due Status</h3>
                <span className="text-xs font-mono font-bold text-indigo-700">
                  ₹{totalBalanceDue.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Semester accommodation and monthly mess bills.
              </p>

              <div className="mt-4 space-y-2.5">
                {myPendingFees.length === 0 ? (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All hostel fees are fully settled. No pending balance!</span>
                  </div>
                ) : (
                  myPendingFees.map((fee) => (
                    <div key={fee._id} className="p-3 rounded-lg border border-slate-200 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="capitalize">{fee.feeType.replace('_', ' ')}</span>
                        <span className="font-mono text-indigo-700 font-bold">₹{fee.balance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                        <span>Due: {fee.dueDate}</span>
                        <span className="capitalize">{fee.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => onSelectTab('fees')}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Manage Fees & Receipts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Staff & Admin Detailed Panels */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hostel Occupancy Breakdown */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Residence Hall Occupancy Summary</h3>
              <button
                onClick={() => onSelectTab('occupancy')}
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                Full Analytics Report &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {stats?.hostelBreakdown.map((h) => (
                <div key={h.hostelId} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{h.hostelName}</p>
                      <p className="text-slate-500 font-mono mt-0.5">
                        Code: {h.code} · Type: {h.type.toUpperCase()} · {h.totalRooms} Rooms
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                        {h.occupancyRate}%
                      </p>
                      <p className="text-slate-500 text-[11px] tabular-nums">
                        {h.occupiedBeds} / {h.totalBeds} Beds
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full ${
                        h.occupancyRate > 85 ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${h.occupancyRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Quick Actions & Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Operational Focus</h3>

            <div className="space-y-3">
              <div
                onClick={() => onSelectTab('admissions')}
                className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900">Admissions Processing</p>
                  <p className="text-[11px] text-slate-500">Review pending student forms</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>

              <div
                onClick={() => onSelectTab('allocations')}
                className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900">Room Allocations</p>
                  <p className="text-[11px] text-slate-500">Assign approved students to beds</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>

              <div
                onClick={() => onSelectTab('maintenance')}
                className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900">Open Maintenance</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {pendingMaintCount} tickets pending assignment
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>

              <div
                onClick={() => onSelectTab('visitors')}
                className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900">Gate Security Passes</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {checkedInVisitorsCount} visitors checked in
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
