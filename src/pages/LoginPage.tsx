import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Building2, Shield, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { UserRole } from '../types/index.ts';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, register, switchDemoUser } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('admin@campus.edu');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          phone,
          studentId,
          department,
          year: '1st Year',
        });
      } else {
        await login(email, password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setError('');
    setLoading(true);
    try {
      await switchDemoUser(role);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Left Column: Campus Imagery & Highlights */}
        <div className="relative hidden md:flex flex-col justify-between p-8 bg-slate-900 text-white overflow-hidden">
          <img
            src="/src/assets/images/hostel_campus_building_1791699512084.jpg"
            alt="Campus Hostel Residence Hall"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
            referrerPolicy="no-referrer"
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 text-indigo-400">
              <Building2 className="w-6 h-6" />
              <span className="text-sm font-bold tracking-wider uppercase">Central University</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-6">
              Institutional Hostel Management System
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Unified digital operations for student residency, room allocation, online fee billing, maintenance ticketing, and automated visitor gate passes.
            </p>
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-700/60 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Role-Based Access Control (RBAC) & Audit Logs</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Real-Time Bed Occupancy & Capacity Enforcement</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Form & 1-Click Role Switcher */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              {isRegister ? 'New Student Registration' : 'Sign in to Portal'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isRegister
                ? 'Create a student profile to apply for hostel residency'
                : 'Select a 1-click demo role or sign in with registered credentials'}
            </p>
          </div>

          {/* Quick 1-Click Test Roles */}
          {!isRegister && (
            <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                1-Click Role Access (Evaluation)
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg text-slate-700 font-medium transition-all text-left flex items-center justify-between"
                >
                  <span>Administrator</span>
                  <span className="text-[10px] text-slate-400">Dr. Sharma</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('warden')}
                  className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg text-slate-700 font-medium transition-all text-left flex items-center justify-between"
                >
                  <span>Warden</span>
                  <span className="text-[10px] text-slate-400">Prof. Anita</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('finance')}
                  className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg text-slate-700 font-medium transition-all text-left flex items-center justify-between"
                >
                  <span>Finance Staff</span>
                  <span className="text-[10px] text-slate-400">Mr. Vikram</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('student')}
                  className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg text-slate-700 font-medium transition-all text-left flex items-center justify-between"
                >
                  <span>Student</span>
                  <span className="text-[10px] text-slate-400">Rohan Verma</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Krishnan"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Register No.</label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="2026CS2001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98700 00000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institutional Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? 'Authenticating...' : isRegister ? 'Register Student Profile' : 'Sign In'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {isRegister
                ? 'Already have an account? Sign in here'
                : 'Need to apply for hostel? Register as a student'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
