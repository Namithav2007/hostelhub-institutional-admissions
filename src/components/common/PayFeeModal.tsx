import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { FeeRecord } from '../../types/index.ts';
import { X, CreditCard, ShieldCheck, Banknote, Smartphone } from 'lucide-react';

interface PayFeeModalProps {
  fee: FeeRecord | null;
  onClose: () => void;
  onSuccess: (receiptNumber: string) => void;
}

export const PayFeeModal: React.FC<PayFeeModalProps> = ({ fee, onClose, onSuccess }) => {
  if (!fee) return null;

  const [amount, setAmount] = useState<number>(fee.balance || fee.totalAmount);
  const [method, setMethod] = useState<'online_gateway' | 'upi' | 'card' | 'bank_transfer' | 'cash_office'>('online_gateway');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (amount <= 0 || amount > fee.balance) {
      setError(`Amount must be between ₹1 and ₹${fee.balance.toLocaleString()}`);
      return;
    }

    setLoading(true);
    try {
      const res = await api.payFee(fee._id, {
        amount,
        paymentMethod: method,
        notes: notes || 'Student hostel fee payment',
      });
      onSuccess(res.transaction.receiptNumber);
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Record Fee Payment</h3>
            <p className="text-xs text-slate-500 font-mono">Invoice: {fee.invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Fee Overview */}
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Student:</span>
              <span className="font-semibold text-slate-900">{fee.studentName}</span>
              <span className="text-slate-500 block mt-1">Fee Type:</span>
              <span className="font-medium text-slate-800 capitalize">{fee.feeType.replace('_', ' ')}</span>
            </div>
            <div className="text-right font-mono">
              <span className="text-slate-500 block">Total Due:</span>
              <span className="text-slate-700">₹{fee.totalAmount.toLocaleString()}</span>
              <span className="text-slate-500 block mt-1">Current Balance:</span>
              <span className="text-base font-bold text-indigo-700">₹{fee.balance.toLocaleString()}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                min="1"
                max={fee.balance}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg text-sm font-mono font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setAmount(fee.balance)}
                className="text-xs text-indigo-600 hover:underline font-medium"
              >
                Pay Full Balance (₹{fee.balance.toLocaleString()})
              </button>
              {fee.balance > 2000 && (
                <>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => setAmount(Math.round(fee.balance / 2))}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Pay Half (₹{Math.round(fee.balance / 2).toLocaleString()})
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setMethod('online_gateway')}
                className={`p-3 rounded-lg border flex items-center gap-2.5 transition-all text-left ${
                  method === 'online_gateway'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>Online Gateway</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`p-3 rounded-lg border flex items-center gap-2.5 transition-all text-left ${
                  method === 'upi'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>Campus UPI QR</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('cash_office')}
                className={`p-3 rounded-lg border flex items-center gap-2.5 transition-all text-left ${
                  method === 'cash_office'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-4 h-4 text-indigo-600" />
                <span>Hostel Cash Counter</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('bank_transfer')}
                className={`p-3 rounded-lg border flex items-center gap-2.5 transition-all text-left ${
                  method === 'bank_transfer'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Bank IMPS/NEFT</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transaction Notes / Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid via student portal debit card"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
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
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Confirm & Pay ₹${amount.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
