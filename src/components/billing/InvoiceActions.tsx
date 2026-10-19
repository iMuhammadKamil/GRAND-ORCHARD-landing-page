"use client";

import { useState } from "react";
import { RecordPaymentModal } from "./RecordPaymentModal";
import { ResidentPaymentModal } from "./ResidentPaymentModal";
import { DollarSign, Printer, Upload, AlertCircle } from "lucide-react";
import Link from "next/link";

interface InvoiceActionsProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    paidAmount: number;
    status: string;
    allocation: {
      resident: {
        userId?: string;
        user: { fullName: string };
      };
      bed: {
        bedNumber: string;
        room: {
          roomNumber: string;
          floor: { building: { name: string } };
        };
      };
    };
  };
  canCollectPayment: boolean;
  isResidentUser?: boolean;
}

export function InvoiceActions({
  invoice,
  canCollectPayment,
  isResidentUser = false,
}: InvoiceActionsProps) {
  const [recordOpen, setRecordOpen] = useState(false);
  const [residentPayOpen, setResidentPayOpen] = useState(false);
  const remaining = invoice.totalAmount - invoice.paidAmount;
  const isPayable = remaining > 0 && invoice.status !== "CANCELLED";

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        {/* Printable Voucher Link */}
        <Link
          href={`/dashboard/billing/${invoice.id}`}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="View & Print Invoice Voucher"
        >
          <Printer className="w-3.5 h-3.5" />
        </Link>

        {/* Staff Payment Recording Button */}
        {canCollectPayment && isPayable && (
          <button
            type="button"
            onClick={() => setRecordOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors focus:outline-hidden focus:ring-4 focus:ring-emerald-500/12"
            title="Record Staff Payment"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Pay</span>
          </button>
        )}

        {/* Resident Upload Payment Proof Button */}
        {isResidentUser && isPayable && (
          <button
            type="button"
            onClick={() => setResidentPayOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors focus:outline-hidden focus:ring-4 focus:ring-blue-500/12"
            title="Submit Payment Proof"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Pay Dues</span>
          </button>
        )}
      </div>

      {/* Staff Record Payment Modal */}
      {recordOpen && (
        <RecordPaymentModal
          isOpen={recordOpen}
          onClose={() => setRecordOpen(false)}
          invoice={invoice}
        />
      )}

      {/* Resident Payment Proof Modal */}
      {residentPayOpen && (
        <ResidentPaymentModal
          isOpen={residentPayOpen}
          onClose={() => setResidentPayOpen(false)}
          invoice={invoice}
        />
      )}
    </>
  );
}
