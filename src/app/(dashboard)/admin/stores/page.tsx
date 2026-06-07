import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import Link from "next/link";
import { Plus, Edit, Store as StoreIcon, BarChart } from "lucide-react";

export default async function StoresPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "Admin") {
    redirect("/dashboard");
  }

  await dbConnect();
  
  // Fetch stores from MongoDB, convert to plain JS objects to pass to client
  const storesDoc = await Store.find({}).sort({ createdAt: -1 }).lean();
  const stores = storesDoc.map((store: any) => ({
    _id: store._id.toString(),
    storeName: store.storeName,
    managerName: store.managerName,
    contactNumber: store.contactNumber,
    isActive: store.isActive,
    gstNumber: store.gstNumber,
    address: store.address
  }));

  return (
    <div className="flex flex-col gap-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Manage Stores</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>View, add, or edit store locations.</p>
        </div>
        <Link href="/admin/stores/new" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={18} /> Add New Store
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-surface-200)', backgroundColor: 'var(--color-surface-50)' }}>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Store Name</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Manager</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Contact</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <StoreIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No stores found. Add your first store to get started.</p>
                </td>
              </tr>
            ) : (
              stores.map((store) => (
                <tr key={store._id} style={{ borderBottom: '1px solid var(--color-surface-200)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{store.storeName}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>{store.managerName}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>{store.contactNumber}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: 'var(--radius-full)', 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: store.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: store.isActive ? 'var(--color-success)' : 'var(--color-error)'
                    }}>
                      {store.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <Link href={`/dashboard?storeId=${store._id}`} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }} title="View Performance">
                      <BarChart size={16} />
                    </Link>
                    <Link href={`/admin/stores/${store._id}/edit`} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }} title="Edit Store">
                      <Edit size={16} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
