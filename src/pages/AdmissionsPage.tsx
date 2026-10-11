import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { AdmissionApplication, Hostel } from '../types/index.ts';
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Building,
  BedDouble,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { AllocationModal } from '../components/common/AllocationModal.tsx';

export const AdmissionsPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedAppForAllocation, setSelectedAppForAllocation] = useState<AdmissionApplication | null>(null);

  // Application form state
  const [formData, setFormData] = useState({
    studentName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: 'male',
    dateOfBirth: '2005-06-15',
    department: user?.department || 'Computer Science & Engineering',
    academicYear: '2026-2027',
    registrationNumber: user?.studentId || '',
    guardianName: '',
    guardianPhone: '',
    guardianRelation: 'Parent',
    address: '',
    bloodGroup: 'B+',
    preferredHostelId: '',
    preferredRoomType: 'double',
    foodPreference: 'vegetarian',
  });
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apps, hList] = await Promise.all([
        api.getAdmissions(),
        api.getHostels(),
      ]);
      setApplications(apps);
      setHostels(hList);
      if (hList.length > 0 && !formData.preferredHostelId) {
        setFormData((prev) => ({ ...prev, preferredHostelId: hList[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError('');
    setApplySuccess('');

    try {
      await api.applyAdmission(formData);
      setApplySuccess('Application submitted successfully! Our hostel committee will review your documents.');
      setShowApplyModal(false);
      loadData();
    } catch (err: any) {
      setApplyError(err.message || 'Failed to submit application');
    }
  };

  const handleUpdateStatus = async (appId: string, status: string) => {
    const remarks = prompt(`Enter review remarks for marking as ${status.toUpperCase()}:`, `Application verified and marked as ${status}`);
    if (remarks === null) return;

    try {
      await api.updateAdmissionStatus(appId, { status, remarks });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isStaff = user?.role === 'warden' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Hostel Admissions & Application Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Module A · Application processing, document verification, and admission approval workflows.
          </p>
        </div>

        <button
          onClick={() => {
            setApplyError('');
            setShowApplyModal(true);
          }}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Apply for Hostel Admission
        </button>
      </div>

      {applySuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{applySuccess}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by student, app ID, dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
          />
        </div>

        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-stretch sm:self-auto overflow-x-auto">
          {['all', 'pending', 'approved', 'allocated', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Academic Details</th>
                <th className="py-3 px-4">Preference</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted</th>
                {isStaff && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading admission records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No hostel admission applications match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {app.applicationNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{app.studentName}</p>
                      <p className="text-slate-500 font-mono text-[11px]">{app.email}</p>
                      <p className="text-slate-500 text-[11px]">Guardian: {app.guardianName || 'Parent'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-800">{app.department}</p>
                      <p className="text-slate-500 font-mono text-[11px]">Reg: {app.registrationNumber}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-800">{app.preferredHostelName}</p>
                      <span className="text-[11px] text-slate-500 capitalize">
                        {app.preferredRoomType} room · {app.foodPreference}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          app.status === 'allocated'
                            ? 'bg-purple-50 text-purple-700'
                            : app.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : app.status === 'rejected'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {app.status.replace('_', ' ')}
                      </span>
                      {app.remarks && (
                        <p className="text-[10px] text-slate-400 mt-1 max-w-xs truncate" title={app.remarks}>
                          {app.remarks}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] tabular-nums">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    {isStaff && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {app.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(app._id, 'approved')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(app._id, 'rejected')}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-medium transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {app.status === 'approved' && (
                            <button
                              onClick={() => setSelectedAppForAllocation(app)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-medium transition-colors flex items-center gap-1"
                            >
                              <BedDouble className="w-3 h-3" />
                              Allocate Bed
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Hostel Admission Application Form</h3>
                <p className="text-xs text-slate-500">Provide official student and accommodation details</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleApply} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {applyError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {applyError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Student Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Register / Student ID</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="2026CS1090"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98700 12345"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Parent / Guardian Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Guardian Name</label>
                    <input
                      type="text"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="e.g. Anand Verma"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Guardian Phone</label>
                    <input
                      type="tel"
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      placeholder="+91 94222 00000"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Relation</label>
                    <input
                      type="text"
                      value={formData.guardianRelation}
                      onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                      placeholder="Father / Mother / Guardian"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Hostel</label>
                  <select
                    value={formData.preferredHostelId}
                    onChange={(e) => setFormData({ ...formData, preferredHostelId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  >
                    {hostels.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name} ({h.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Preference</label>
                  <select
                    value={formData.preferredRoomType}
                    onChange={(e) => setFormData({ ...formData, preferredRoomType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs capitalize"
                  >
                    <option value="single">Single Occupancy</option>
                    <option value="double">Double Sharing</option>
                    <option value="triple">Triple Sharing</option>
                    <option value="quad">Four Person Quad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mess Food Preference</label>
                  <select
                    value={formData.foodPreference}
                    onChange={(e) => setFormData({ ...formData, foodPreference: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs capitalize"
                  >
                    <option value="vegetarian">Vegetarian</option>
                    <option value="non-vegetarian">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent Residential Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, State, Pin Code..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocation Modal Triggered from Approved Application */}
      {selectedAppForAllocation && (
        <AllocationModal
          isOpen={true}
          onClose={() => setSelectedAppForAllocation(null)}
          onSuccess={() => {
            setSelectedAppForAllocation(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
