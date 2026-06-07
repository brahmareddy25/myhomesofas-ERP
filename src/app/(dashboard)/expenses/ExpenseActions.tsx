"use client";

import { Check, X, FileImage } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';

export default function ExpenseActions({ expenseId, status, role }: { expenseId: string, status: string, role: string }) {
  const router = useRouter();

  const handleUpdate = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        router.refresh();
      } else {
        toast.error("Failed to update. Admin privileges required.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
      <button className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }} title="View Receipt">
        <FileImage size={16} />
      </button>
      {status === 'Pending Approval' && role === "Admin" && (
        <>
          <button onClick={() => handleUpdate("Approved")} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', borderColor: 'var(--color-success)' }} title="Approve">
            <Check size={16} />
          </button>
          <button onClick={() => handleUpdate("Rejected")} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--color-error)', borderColor: 'var(--color-error)' }} title="Reject">
            <X size={16} />
          </button>
        </>
      )}
    </div>
  );
}
