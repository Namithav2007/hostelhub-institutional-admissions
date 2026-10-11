import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  receiptData: {
    transaction: any;
    fee: any;
    student?: any;
  } | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receiptData, onClose }) => {
  if (!receiptData || !receiptData.transaction) return null;

  const { transaction, fee, student } = receiptData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print px-6 py-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Official Institutional Fee Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-8 sm:p-10 bg-white" id="printable-receipt">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-6 text-center">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 uppercase">
              Central University Hostels
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Office of the Chief Hostel Administrator & Finance Office
            </p>
            <p className="text-xs text-slate-500 font-mono">
              University Campus, Academic District · Contact: finance-hostel@campus.edu
            </p>
            <div className="mt-4 inline-block px-4 py-1 border border-slate-900 text-xs font-bold uppercase tracking-wider text-slate-900">
              Electronic Payment Receipt
            </div>
          </div>

          {/* Receipt Meta */}
          <div className="grid grid-cols-2 gap-4 py-6 border-b border-slate-200 text-xs">
            <div>
              <p className="text-slate-500">Receipt Number:</p>
              <p className="font-mono font-bold text-slate-900 text-sm">{transaction.receiptNumber}</p>
              <p className="text-slate-500 mt-2">Transaction Reference:</p>
              <p className="font-mono text-slate-700">{transaction.transactionReference}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500">Date & Time:</p>
              <p className="font-mono text-slate-900 font-semibold">
                {new Date(transaction.paymentDate).toLocaleString()}
              </p>
              <p className="text-slate-500 mt-2">Payment Mode:</p>
              <p className="font-medium capitalize text-slate-800">
                {transaction.paymentMethod?.replace('_', ' ') || 'Online Gateway'}
              </p>
            </div>
          </div>

          {/* Resident Details */}
          <div className="py-6 border-b border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Resident Information
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Student Name:</span>
                <span className="font-semibold text-slate-900">{transaction.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Student ID / Reg:</span>
                <span className="font-mono font-medium text-slate-800">
                  {student?.studentId || fee?.studentRegisterNo || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Department:</span>
                <span className="text-slate-800">{student?.department || 'Engineering'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Hostel Residence:</span>
                <span className="font-medium text-slate-800">{fee?.hostelName || 'Aryabhatta Residence'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Room Number:</span>
                <span className="font-mono font-semibold text-slate-900">{fee?.roomNumber || 'A-204'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Fee Invoice:</span>
                <span className="font-mono text-slate-800">{fee?.invoiceNumber || 'INV-2026-0891'}</span>
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="py-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Payment Breakdown
            </h4>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600 font-semibold">
                  <th className="py-2">Item Description</th>
                  <th className="py-2">Billing Term</th>
                  <th className="py-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 font-medium text-slate-900">
                    {fee?.feeType?.replace('_', ' ').toUpperCase() || 'HOSTEL RESIDENCE FEE'}
                  </td>
                  <td className="py-2 text-slate-600">{fee?.period || 'Academic Semester 2026-2027'}</td>
                  <td className="py-2 font-mono text-right font-semibold text-slate-900 tabular-nums">
                    ₹{transaction.amount?.toLocaleString()}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 font-bold text-sm">
                  <td colSpan={2} className="py-3 text-slate-900">Total Paid (INR):</td>
                  <td className="py-3 text-right font-mono text-indigo-700 tabular-nums">
                    ₹{transaction.amount?.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>

            {fee && (
              <div className="mt-3 bg-slate-50 p-3 rounded-lg flex items-center justify-between text-xs font-mono">
                <span className="text-slate-600">Total Invoice Amount: ₹{fee.totalAmount?.toLocaleString()}</span>
                <span className="text-slate-600">Remaining Balance: ₹{fee.balance?.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Verification Badge & Stamp */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-emerald-700">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Status: Completed & Verified by Finance Department</span>
            </div>
            <div className="text-center sm:text-right text-[11px] text-slate-500">
              <div className="border border-slate-300 rounded p-2 inline-block bg-slate-50 font-mono text-[10px]">
                OFFICIALLY CERTIFIED
                <br />
                ACCOUNTS OFFICER
              </div>
              <p className="mt-1">Computer generated electronic receipt</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
