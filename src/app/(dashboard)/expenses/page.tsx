import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Expense from "@/models/Expense";
import Link from "next/link";
import { Plus } from "lucide-react";
import ExpenseActions from "./ExpenseActions";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const role = (session.user as any).role;
  const storeId = (session.user as any).storeId;

  await dbConnect();
  const query = role === "Store" ? { storeId } : {};
  const expensesDoc = await Expense.find(query).populate('storeId', 'storeName').sort({ createdAt: -1 }).lean();
  
  const expenses = expensesDoc.map((exp: any) => ({
    _id: exp._id.toString(),
    storeName: exp.storeId?.storeName || "Unknown Store",
    category: exp.category,
    amount: exp.amount,
    dateIncurred: new Date(exp.dateIncurred || exp.createdAt).toLocaleDateString(),
    status: exp.status
  }));

  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.6s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '1px' }}>Expense <span className="text-gold" style={{ fontWeight: 600 }}>Approvals</span></h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Review and manage store-level operational costs.</p>
        </div>
        <Link href="/expenses/new" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={18} /> Submit Expense
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>ID</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Store Location</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Category</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Amount</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Status</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
               <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No expenses logged yet.</td></tr>
            )}
            {expenses.map((exp) => (
              <tr key={exp._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1.5rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>{exp._id.slice(-6).toUpperCase()}</td>
                <td style={{ padding: '1.5rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>{exp.storeName}</td>
                <td style={{ padding: '1.5rem', color: 'var(--color-text-secondary)' }}>{exp.category}</td>
                <td style={{ padding: '1.5rem', fontWeight: 600, color: 'var(--color-gold-primary)', fontSize: '1.1rem' }}>₹{exp.amount.toLocaleString()}</td>
                <td style={{ padding: '1.5rem' }}>
                  <span style={{ 
                    padding: '0.35rem 0.85rem', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: exp.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : exp.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: exp.status === 'Approved' ? 'var(--color-success)' : exp.status === 'Rejected' ? 'var(--color-error)' : 'var(--color-warning)',
                    border: `1px solid ${exp.status === 'Approved' ? 'var(--color-success)' : exp.status === 'Rejected' ? 'var(--color-error)' : 'var(--color-warning)'}`,
                    letterSpacing: '0.5px'
                  }}>
                    {exp.status}
                  </span>
                </td>
                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                  <ExpenseActions expenseId={exp._id} status={exp.status} role={role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
