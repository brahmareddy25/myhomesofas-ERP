import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import ExpenseForm from "../ExpenseForm";

export default async function NewExpensePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await dbConnect();
  
  const role = (session.user as any).role;
  const storeId = (session.user as any).storeId;

  const query = role === "Store" ? { _id: storeId } : {};
  const storesDoc = await Store.find(query).select('_id storeName').lean();
  const stores = storesDoc.map(s => ({ _id: s._id.toString(), storeName: s.storeName }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '1px' }}>Submit <span className="text-gold" style={{ fontWeight: 600 }}>Expense</span></h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Log a new operational expense for approval.</p>
      </div>

      <div className="card">
        <ExpenseForm stores={stores} role={role} />
      </div>
    </div>
  );
}
