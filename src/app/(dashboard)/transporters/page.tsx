import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Transporter from "@/models/Transporter";
import Link from "next/link";
import { Truck, Plus, MapPin, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TransportersPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  await dbConnect();
  const transportersDoc = await Transporter.find({}).sort({ createdAt: -1 }).lean();
  
  const transporters = transportersDoc.map((trn: any) => ({
    _id: trn._id.toString(),
    name: trn.name,
    contact: trn.contactPerson,
    phone: trn.phone,
    vehicles: trn.vehicleNumber || "Not specified",
    rate: trn.baseRatePerKm ? `₹${trn.baseRatePerKm}/km` : "Custom",
    status: trn.isActive ? "Active" : "Inactive"
  }));

  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.6s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '1px' }}>Delivery <span className="text-gold" style={{ fontWeight: 600 }}>Logistics</span></h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Manage third-party transport partners and freight rates.</p>
        </div>
        <Link href="/transporters/new" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={18} /> Add Transporter
        </Link>
      </div>

      {transporters.length === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-lg)' }}>
          No transporters configured yet.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {transporters.map(trn => (
          <div key={trn._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)' }}>
                  <Truck size={24} className="text-gold" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>{trn.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>ID: {trn._id.slice(-6).toUpperCase()}</span>
                </div>
              </div>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                color: trn.status === 'Active' ? 'var(--color-success)' : 'var(--color-text-muted)',
                background: trn.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 107, 117, 0.1)',
                padding: '0.25rem 0.75rem', 
                borderRadius: 'var(--radius-full)' 
              }}>
                {trn.status}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                <Phone size={16} color="var(--color-text-muted)" />
                <span style={{ color: 'var(--color-text-secondary)' }}>{trn.contact} - </span>
                <span style={{ color: 'var(--color-text-primary)' }}>{trn.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                <Truck size={16} color="var(--color-text-muted)" />
                <span style={{ color: 'var(--color-text-primary)' }}>{trn.vehicles}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                <MapPin size={16} color="var(--color-text-muted)" />
                <span style={{ color: 'var(--color-gold-primary)', fontWeight: 600 }}>{trn.rate}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
              <Link href={`/transporters/${trn._id}/edit`} className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }}>Edit Profile</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
