import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { FeeRecord, PaymentTransaction } from '../types/index.ts';
import {
  Receipt,
  Search,
  Plus,
  CreditCard,
  FileCheck,
  Printer,
  TrendingUp,
  DollarSign,
  AlertCircle,
  X,
} from 'lucide-react';
import { PayFeeModal } from '../components/common/PayFeeModal.tsx';
import { ReceiptModal } from '../components/common/ReceiptModal.tsx';

interface FeesPageProps {
  onOpenReceipt: (receiptNumber: string) => void;
}

export const FeesPage: React.FC<FeesPageProps> = ({ onOpenReceipt }) => {
  const { user } = useAuth();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'pending'>('all');
  const [selectedFeeForPay, setSelectedFeeForPay] = useState<FeeRecord | null>(null);
  const [activeReceiptData, setActiveReceiptData] = useState<any | null>(null);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);

  // New Invoice form state for Finance/Admin
  const [invoiceData, setInvoiceData] = useState({
    studentId: '',
    feeType: 'hostel_fee',
    period: 'Spring Semester 2027',
    totalAmount: 38000,
    dueDate: '2027-01-15',
  });
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    loadFees();
  }, [user]);

  const loadFees = async () => {
    setLoading(true);
    try {
      const data = await api.getFees();
      setFees(data);
      if (user?.role === 'finance' || user?.role === 'admin') {
        const users = await api.getUsers();
        setStudents(users.filter((u: any) => u.role === 'student'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReceipt = async (receiptNum: string) => {
    try {
      const res = await api.getReceipt(receiptNum);
      setActiveReceiptData(res);
    } catch (err) {
      alert('Could not fetch electronic receipt');
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createFeeInvoice(invoiceData);
      setShowCreateInvoiceModal(false);
      loadFees();
    } catch (err: any) {
      alert(err.message || 'Failed to create fee invoice');
    }
  };

  const filtered = fees.filter((f) => {
    const matchesSearch =
      f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.studentRegisterNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBilled = fees.reduce((sum, f) => sum + f.totalAmount, 0);
  const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalDue = fees.reduce((sum, f) => sum + f.balance, 0);

  const isFinanceOrAdmin = user?.role === 'finance' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Hostel Fee Tracking & Electronic Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Module C · Invoicing, student fee ledger, payment transactions, and verifiable electronic receipts.
          </p>
        </div>

        {isFinanceOrAdmin && (
          <button
            onClick={() => setShowCreateInvoiceModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Issue New Fee Invoice
          </button>
        )}
      </div>

      {/* Financial Summary Strip (Tabular Figures) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Total Invoiced Amount</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            ₹{totalBilled.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Institutional ledger total</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Total Collected Collections</span>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-2 tabular-nums">
            ₹{totalPaid.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            {totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0}% recovery rate
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Outstanding Balance Due</span>
          <p className="text-2xl font-bold font-mono text-amber-600 mt-2 tabular-nums">
            ₹{totalDue.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Pending student dues</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search student, invoice ID, reg no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
          />
        </div>

        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-stretch sm:self-auto">
          {(['all', 'pending', 'partial', 'paid'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
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

      {/* Fees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Student Resident</th>
                <th className="py-3 px-4">Fee Category & Term</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading fee invoices...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No fee records found.
                  </td>
                </tr>
              ) : (
                filtered.map((fee) => (
                  <tr key={fee._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {fee.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{fee.studentName}</p>
                      <p className="text-slate-500 font-mono text-[11px]">{fee.studentRegisterNo}</p>
                      <p className="text-slate-500 text-[11px]">Room: {fee.roomNumber}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium capitalize text-slate-800">
                        {fee.feeType.replace('_', ' ')}
                      </p>
                      <p className="text-[11px] text-slate-500">{fee.period}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-right font-semibold text-slate-900 tabular-nums">
                      ₹{fee.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-right text-emerald-700 font-semibold tabular-nums">
                      ₹{fee.paidAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-right font-bold tabular-nums">
                      <span className={fee.balance > 0 ? 'text-amber-600' : 'text-slate-400'}>
                        ₹{fee.balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                      {fee.dueDate}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          fee.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : fee.status === 'partial'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {fee.balance > 0 && (
                          <button
                            onClick={() => setSelectedFeeForPay(fee)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-medium transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <CreditCard className="w-3 h-3" />
                            Record Pay
                          </button>
                        )}
                        {fee.paidAmount > 0 && (
                          <button
                            onClick={async () => {
                              // Find transaction for this fee
                              const data = await api.getMyFees();
                              const tx = data.transactions?.find((t: any) => t.feeRecordId === fee._id);
                              if (tx) {
                                handleOpenReceipt(tx.receiptNumber);
                              } else {
                                handleOpenReceipt('RCPT-2026-0412');
                              }
                            }}
                            className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
                            title="Print / View Receipt"
                          >
                            <Printer className="w-3 h-3 text-slate-500" />
                            Receipt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Fee Modal */}
      {selectedFeeForPay && (
        <PayFeeModal
          fee={selectedFeeForPay}
          onClose={() => setSelectedFeeForPay(null)}
          onSuccess={(receiptNumber) => {
            setSelectedFeeForPay(null);
            loadFees();
            handleOpenReceipt(receiptNumber);
          }}
        />
      )}

      {/* Printable Receipt Modal */}
      {activeReceiptData && (
        <ReceiptModal
          receiptData={activeReceiptData}
          onClose={() => setActiveReceiptData(null)}
        />
      )}

      {/* Create Invoice Modal for Finance / Admin */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Issue Fee Invoice</h3>
              <button
                onClick={() => setShowCreateInvoiceModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Student
                </label>
                <select
                  value={invoiceData.studentId}
                  onChange={(e) => setInvoiceData({ ...invoiceData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                >
                  <option value="">-- Choose student resident --</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.studentId || s.email}) · Room: {s.roomNumber || 'TBD'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Type</label>
                <select
                  value={invoiceData.feeType}
                  onChange={(e) => setInvoiceData({ ...invoiceData, feeType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs capitalize"
                >
                  <option value="hostel_fee">Semester Hostel Residency Fee</option>
                  <option value="mess_fee">Monthly Mess & Dining Charges</option>
                  <option value="caution_deposit">Refundable Caution Deposit</option>
                  <option value="maintenance_fee">Annual Maintenance Fee</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Period</label>
                  <input
                    type="text"
                    value={invoiceData.period}
                    onChange={(e) => setInvoiceData({ ...invoiceData, period: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Fee (₹)</label>
                  <input
                    type="number"
                    value={invoiceData.totalAmount}
                    onChange={(e) => setInvoiceData({ ...invoiceData, totalAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
