import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Link from "next/link";
import { Edit, Eye, Plus, Users as UsersIcon } from "lucide-react";
import ServerSearch from "@/components/ui/ServerSearch";
import ServerPagination from "@/components/ui/ServerPagination";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  const storeId = (session.user as any).storeId;

  await dbConnect();
  
  // If Store role, only show their customers. If Admin, show all.
  const query: any = role === "Store" ? { storeId: storeId } : {};
  
  // Search logic
  const searchQ = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';
  if (searchQ) {
    query.$or = [
      { customerName: { $regex: searchQ, $options: 'i' } },
      { mobileNumber: { $regex: searchQ, $options: 'i' } },
      { emailAddress: { $regex: searchQ, $options: 'i' } },
      { city: { $regex: searchQ, $options: 'i' } }
    ];
  }

  // Pagination logic
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const totalItems = await Customer.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);
  
  const customersDoc = await Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  const customers = customersDoc.map((cust: any) => ({
    _id: cust._id.toString(),
    customerName: cust.customerName,
    mobileNumber: cust.mobileNumber,
    city: cust.city,
    createdAt: cust.createdAt.toISOString()
  }));

  return (
    <div className="flex flex-col gap-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Customer Directory</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>View and manage customer profiles.</p>
        </div>
        <Link href="/customers/new" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={18} /> Add Customer
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <ServerSearch placeholder="Search by name, phone, email, or city..." />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-surface-200)', backgroundColor: 'var(--color-surface-50)' }}>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Customer Name</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Mobile Number</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>City</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Registered On</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <UsersIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No customers found.</p>
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer._id} style={{ borderBottom: '1px solid var(--color-surface-200)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{customer.customerName}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>{customer.mobileNumber}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>{customer.city}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <Link href={`/customers/${customer._id}`} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }} title="View Profile">
                        <Eye size={16} />
                      </Link>
                      <Link href={`/customers/${customer._id}/edit`} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }} title="Edit Customer">
                        <Edit size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        <ServerPagination currentPage={page} totalPages={totalPages} totalItems={totalItems} />
      </div>
    </div>
  );
}
