import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  FileText,
  Building,
  BedDouble,
  Receipt,
  Wrench,
  Users2,
  PieChart,
  UserCheck,
  ShieldCheck,
  User,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['student', 'warden', 'admin', 'finance'],
    },
    {
      id: 'admissions',
      label: role === 'student' ? 'Hostel Application' : 'Admissions Processing',
      icon: FileText,
      roles: ['student', 'warden', 'admin'],
    },
    {
      id: 'rooms',
      label: 'Hostels & Rooms',
      icon: Building,
      roles: ['student', 'warden', 'admin', 'finance'],
    },
    {
      id: 'allocations',
      label: role === 'student' ? 'My Room Allocation' : 'Room Allocations',
      icon: BedDouble,
      roles: ['student', 'warden', 'admin'],
    },
    {
      id: 'fees',
      label: role === 'student' ? 'My Fees & Receipts' : 'Fee Tracking & Receipts',
      icon: Receipt,
      roles: ['student', 'warden', 'admin', 'finance'],
    },
    {
      id: 'maintenance',
      label: role === 'student' ? 'Maintenance Complaints' : 'Maintenance Requests',
      icon: Wrench,
      roles: ['student', 'warden', 'admin'],
    },
    {
      id: 'visitors',
      label: role === 'student' ? 'My Visitors & Pass' : 'Visitor Management',
      icon: Users2,
      roles: ['student', 'warden', 'admin'],
    },
    {
      id: 'occupancy',
      label: 'Occupancy Analytics',
      icon: PieChart,
      roles: ['warden', 'admin', 'finance'],
    },
    {
      id: 'users',
      label: 'User Directory',
      icon: UserCheck,
      roles: ['admin'],
    },
    {
      id: 'audit',
      label: 'System Audit Logs',
      icon: ShieldCheck,
      roles: ['admin'],
    },
    {
      id: 'profile',
      label: 'Resident Profile',
      icon: User,
      roles: ['student'],
    },
  ];

  const visibleItems = menuItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden lg:flex flex-col min-h-[calc(100vh-4rem)]">
      {/* User Mini Profile */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="capitalize font-medium text-indigo-600">{user.role}</span>
              {user.studentId && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{user.studentId}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="p-3 space-y-1 flex-1">
        <p className="px-3 py-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
          Operations
        </p>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Institutional Footer */}
      <div className="p-4 border-t border-slate-100 text-xs text-slate-500">
        <p className="font-medium text-slate-700">Central University Campus</p>
        <p className="text-[11px] text-slate-400">Hostel Administration Portal</p>
      </div>
    </aside>
  );
};
