import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { VisitorRecord } from '../../types/index.ts';
import { X, QrCode, Printer, Shield, CheckCircle2 } from 'lucide-react';

interface VisitorPassModalProps {
  visitor: VisitorRecord | null;
  onClose: () => void;
}

export const VisitorPassModal: React.FC<VisitorPassModalProps> = ({ visitor, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visitor?.qrPassToken) {
      loadQr();
    }
  }, [visitor]);

  const loadQr = async () => {
    if (!visitor) return;
    setLoading(true);
    try {
      const res = await api.getVisitorQrPass(visitor.qrPassToken);
      setQrUrl(res.qrDataUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!visitor) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="no-print px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              Hostel Security Gate Pass
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-800"
              title="Print Pass"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pass Body */}
        <div className="p-6 text-center space-y-4">
          <div>
            <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Pass Number</span>
            <p className="text-xl font-bold font-mono text-slate-900">{visitor.passNumber}</p>
          </div>

          {/* QR Code Container */}
          <div className="flex justify-center my-3">
            <div className="p-3 bg-white border-2 border-dashed border-slate-300 rounded-xl inline-block shadow-xs">
              {loading ? (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                  Generating Secure QR...
                </div>
              ) : qrUrl ? (
                <img src={qrUrl} alt="Visitor QR Pass" className="w-48 h-48 mx-auto" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                  QR Not Available
                </div>
              )}
            </div>
          </div>

          {/* Visitor and Resident Meta */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Visitor:</span>
              <span className="font-semibold text-slate-900">{visitor.visitorName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Phone:</span>
              <span className="font-mono text-slate-800">{visitor.visitorPhone}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Host Resident:</span>
              <span className="font-semibold text-slate-900">{visitor.studentName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Room Number:</span>
              <span className="font-mono font-semibold text-indigo-700">{visitor.studentRoom}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Purpose of Visit:</span>
              <span className="text-slate-800">{visitor.purpose}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Check-in Time:</span>
              <span className="font-mono text-slate-800">
                {new Date(visitor.checkInTime).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Status info */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Authorized by Hostel Security Warden Desk</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Show this digital QR pass at security checkpoint upon entry and exit.
          </p>
        </div>
      </div>
    </div>
  );
};
