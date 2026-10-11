import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserRole } from '../../types/index.ts';
import { Building2, Bell, Shield, LogOut, ChevronDown, Check } from 'lucide-react';
import { NotificationDrawer } from '../common/NotificationDrawer.tsx';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout, switchDemoUser } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'admin', label: 'Administrator', desc: 'Full institutional control & audit' },
    { role: 'warden', label: 'Hostel Warden', desc: 'Room allocations & visitor approvals' },
    { role: 'finance', label: 'Finance Staff', desc: 'Fee invoicing & transaction records' },
    { role: 'student', label: 'Student Resident', desc: 'Applications, room & complaints' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <button
            onClick={() => onSelectTab('dashboard')}
            className="text-left text-lg font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors whitespace-nowrap"
          >
            HostelHub
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              currentTab === 'dashboard' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onSelectTab('admissions')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              currentTab === 'admissions' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Admissions
          </button>
          <button
            onClick={() => onSelectTab('rooms')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              currentTab === 'rooms' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Rooms & Beds
          </button>
          <button
            onClick={() => onSelectTab('fees')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              currentTab === 'fees' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Fees & Billing
          </button>
          <button
            onClick={() => onSelectTab('occupancy')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              currentTab === 'occupancy' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Occupancy
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action / User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNotifOpen(true)}
                title="Notifications"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-4 h-4" />
              </button>

              {/* Role Switcher Popover */}
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span className="capitalize font-semibold text-indigo-700">{user.role}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      {user.roomNumber && (
                        <p className="text-xs text-indigo-600 mt-1 font-mono">Room: {user.roomNumber}</p>
                      )}
                    </div>

                    <div className="px-3 py-2">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Switch Role (Testing)
                      </p>
                      {roles.map((r) => (
                        <button
                          key={r.role}
                          onClick={async () => {
                            setRoleMenuOpen(false);
                            await switchDemoUser(r.role);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                            user.role === r.role
                              ? 'bg-indigo-50 text-indigo-900 font-semibold'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <p className="capitalize">{r.label}</p>
                            <p className="text-[11px] text-slate-400 font-normal">{r.desc}</p>
                          </div>
                          {user.role === r.role && <Check className="w-4 h-4 text-indigo-600" />}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        onClick={() => {
                          setRoleMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => onSelectTab('login')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      <NotificationDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} onSelectTab={onSelectTab} />
    </header>
  );
};
