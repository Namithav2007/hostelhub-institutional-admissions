import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { User, UserRole } from '../types/index.ts';
import { UserCheck, Search, Shield, UserX, CheckCircle2 } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: UserRole, currentStatus: string) => {
    const newRole = prompt(
      `Enter new role (student, warden, finance, admin):`,
      currentRole
    ) as UserRole | null;
    if (!newRole || !['student', 'warden', 'finance', 'admin'].includes(newRole)) return;

    try {
      await api.updateUserRole(userId, { role: newRole, status: currentStatus });
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleStatusToggle = async (userObj: User) => {
    const nextStatus = userObj.status === 'active' ? 'suspended' : 'active';
    if (!confirm(`Confirm changing ${userObj.name}'s account status to ${nextStatus.toUpperCase()}?`)) return;

    try {
      await api.updateUserRole(userObj._id, { role: userObj.role, status: nextStatus });
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.studentId && u.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            User Directory & Access Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Administrative role assignments, resident roster, and account security governance.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search name, email, register ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
          />
        </div>

        {/* Role segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-stretch sm:self-auto overflow-x-auto">
          {['all', 'student', 'warden', 'finance', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize whitespace-nowrap ${
                roleFilter === r
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Name & Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Register / ID</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Room</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No users match your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <p className="text-slate-500 font-mono text-[11px]">{u.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {u.studentId || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {u.department || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {u.roomNumber ? `Room ${u.roomNumber}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRoleChange(u._id, u.role, u.status)}
                          className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded text-[11px] font-medium transition-colors"
                        >
                          Change Role
                        </button>
                        <button
                          onClick={() => handleStatusToggle(u)}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                            u.status === 'active'
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
