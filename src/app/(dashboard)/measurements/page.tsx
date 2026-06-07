import { Ruler, FilePlus, Eye, FileText } from "lucide-react";
import Link from "next/link";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Measurement from "@/models/Measurement";
import Customer from "@/models/Customer";
import Quotation from "@/models/Quotation";
import ServerSearch from "@/components/ui/ServerSearch";
import ServerPagination from "@/components/ui/ServerPagination";

export default async function MeasurementsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session.user as any).role;
  const storeId = (session.user as any).storeId;

  await dbConnect();

  const query: any = role === "Store" ? { storeId: storeId } : {};

  // Find customers that match the search query to filter measurements by customerId
  const searchQ = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';
  if (searchQ) {
    const matchingCustomers = await Customer.find({
      $or: [
        { customerName: { $regex: searchQ, $options: 'i' } },
        { mobileNumber: { $regex: searchQ, $options: 'i' } }
      ]
    }).select('_id').lean();
    
    const customerIds = matchingCustomers.map(c => c._id);
    query.$or = [
      { productType: { $regex: searchQ, $options: 'i' } },
      { customerId: { $in: customerIds } }
    ];
  }

  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const totalItems = await Measurement.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  const measurementsDoc = await Measurement.find(query)
    .populate('customerId', 'customerName mobileNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean() as any[];

  // Also try to find if there is a quotation for each measurement
  const measurementIds = measurementsDoc.map(m => m._id);
  const quotes = await Quotation.find({ measurementId: { $in: measurementIds } }).select('measurementId status').lean();
  const quoteMap = new Map(quotes.map(q => [q.measurementId.toString(), q.status]));

  const measurements = measurementsDoc.map(m => ({
    id: m._id.toString(),
    customer: m.customerId?.customerName || "Unknown",
    type: m.productType,
    dimension: `${m.length||0}x${m.width||0}x${m.height||0}`,
    date: new Date(m.createdAt).toLocaleDateString(),
    status: quoteMap.get(m._id.toString()) || "Quotation Pending"
  }));

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Order Confirmed': return { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' };
      case 'Quoted': return { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-info)' };
      case 'Quotation Pending': return { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' };
      default: return { bg: 'rgba(148, 163, 184, 0.1)', color: 'var(--color-text-secondary)' };
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Measurements Directory</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>View recorded product dimensions and configurations.</p>
        </div>
        <Link href="/measurements/new" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <FilePlus size={18} /> New Measurement
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <ServerSearch placeholder="Search by customer name, phone, or product type..." />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-surface-200)', backgroundColor: 'var(--color-surface-50)' }}>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>ID</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Customer</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Product Type</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Overall Dim. (cm)</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {measurements.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <p>No measurements found.</p>
                </td>
              </tr>
            ) : (
              measurements.map((msr) => {
                const statusStyle = getStatusStyle(msr.status);
              return (
                <tr key={msr.id} style={{ borderBottom: '1px solid var(--color-surface-200)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Ruler size={14} color="var(--color-text-secondary)" /> {msr.id}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{msr.customer}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>{msr.type}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>{msr.dimension}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: 'var(--radius-full)', 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color
                    }}>
                      {msr.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Link href={`/measurements/${msr.id}`} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }} title="View Configuration">
                        <Ruler size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
          </tbody>
        </table>
        
        <ServerPagination currentPage={page} totalPages={totalPages} totalItems={totalItems} />
      </div>
    </div>
  );
}
