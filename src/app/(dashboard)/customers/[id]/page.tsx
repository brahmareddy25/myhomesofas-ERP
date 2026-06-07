import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Measurement from "@/models/Measurement";
import Quotation from "@/models/Quotation";
import Link from "next/link";
import { ArrowLeft, Edit, MapPin, Phone, Mail, Calendar, User as UserIcon } from "lucide-react";

export default async function ViewCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await dbConnect();
  
  const customer = await Customer.findById(resolvedParams.id).lean() as any;
  if (!customer) redirect("/customers");

  // Fetch related data
  const measurements = await Measurement.find({ customerId: customer._id }).sort({ createdAt: -1 }).lean();
  const quotations = await Quotation.find({ customerId: customer._id }).sort({ createdAt: -1 }).lean();

  return (
    <div className="flex flex-col gap-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/customers" className="btn btn-outline" style={{ padding: '0.5rem' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Customer Profile</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>View complete details and history.</p>
          </div>
        </div>
        <Link href={`/customers/${customer._id}/edit`} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Edit size={18} /> Edit Profile
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Left Column: Contact Details */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-surface-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--color-gold-primary)' }}>
              <UserIcon size={40} />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{customer.customerName}</h4>
            <p style={{ color: 'var(--color-text-secondary)' }}>Registered {new Date(customer.createdAt).toLocaleDateString()}</p>
          </div>

          <hr style={{ borderColor: 'var(--color-border)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <Phone size={18} style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }} />
              <div>
                <p style={{ fontWeight: 500 }}>{customer.mobileNumber}</p>
                {customer.alternateMobileNumber && <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Alt: {customer.alternateMobileNumber}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Mail size={18} style={{ color: 'var(--color-text-secondary)' }} />
              <p style={{ fontWeight: 500 }}>{customer.emailAddress || "N/A"}</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <MapPin size={18} style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }} />
              <div>
                <p style={{ fontWeight: 500 }}>{customer.fullAddress}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{customer.city}, {customer.state} - {customer.pincode}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Calendar size={18} style={{ color: 'var(--color-text-secondary)' }} />
              <p style={{ fontWeight: 500 }}>Age: {customer.age || "N/A"} | Gender: {customer.gender || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Right Column: History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-50)' }}>
              <h4 style={{ fontWeight: 600 }}>Measurements ({measurements.length})</h4>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {measurements.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>No measurements found.</p>
              ) : (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {measurements.map((m: any) => (
                    <li key={m._id.toString()} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                      <div>
                        <p style={{ fontWeight: 500 }}>{m.productType}</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{new Date(m.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Link href="/measurements" className="text-sm font-medium" style={{ color: 'var(--color-gold-primary)' }}>View All</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-50)' }}>
              <h4 style={{ fontWeight: 600 }}>Quotations ({quotations.length})</h4>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {quotations.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>No quotations found.</p>
              ) : (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {quotations.map((q: any) => (
                    <li key={q._id.toString()} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                      <div>
                        <p style={{ fontWeight: 500 }}>{q.quotationNumber}</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Status: {q.status}</p>
                      </div>
                      <p style={{ fontWeight: 600 }}>₹{q.finalSellingPrice?.toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
