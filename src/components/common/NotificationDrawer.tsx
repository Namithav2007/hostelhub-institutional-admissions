import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { NotificationItem } from '../../types/index.ts';
import { X, Check, Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, onSelectTab }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifs();
    }
  }, [isOpen]);

  const loadNotifs = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900">Hostel Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50"
            >
              Mark all read
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading notices...</div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">No notices at this time.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`p-4 rounded-xl border transition-all ${
                  n.isRead ? 'bg-white border-slate-200' : 'bg-indigo-50/50 border-indigo-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {n.type === 'alert' || n.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : n.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Info className="w-4 h-4 text-indigo-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      {n.link ? (
                        <button
                          onClick={() => {
                            onClose();
                            onSelectTab(n.link!.replace('/', ''));
                          }}
                          className="text-xs text-indigo-600 font-semibold hover:underline"
                        >
                          View Details &rarr;
                        </button>
                      ) : <span />}
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n._id)}
                          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800"
                        >
                          <Check className="w-3 h-3" /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
