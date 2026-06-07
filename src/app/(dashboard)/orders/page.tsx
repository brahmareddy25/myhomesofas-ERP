"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Clock, Truck, Package, Hammer, ChevronRight, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/orders?q=${encodeURIComponent(searchQuery)}`)
      .then(res => res.json())
      .then(data => {
        if (data.orders) {
          setOrders(data.orders);
        }
      });
  }, [searchQuery]);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Order Confirmed': return <Circle size={16} color="var(--color-info)" />;
      case 'Manufacturing': return <Hammer size={16} color="var(--color-warning)" />;
      case 'Ready For Dispatch': return <Package size={16} color="var(--color-gold-primary)" />;
      case 'Out For Delivery': return <Truck size={16} color="var(--color-info)" />;
      case 'Completed': return <CheckCircle2 size={16} color="var(--color-success)" />;
      default: return <Clock size={16} color="var(--color-text-secondary)" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.6s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '1px' }}>Order <span className="text-gold" style={{ fontWeight: 600 }}>Tracking</span></h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Monitor production timelines. Search to view Completed orders.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="search-bar" style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search by Order # or Customer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="premium-input"
              style={{ paddingLeft: '2.75rem', height: '42px', borderRadius: 'var(--radius-full)' }}
            />
          </div>
          <button onClick={() => router.push("/orders/new")} className="btn btn-primary" style={{ gap: '0.5rem', height: '42px', borderRadius: 'var(--radius-full)' }}>
            <Plus size={18} /> New Order
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
        {orders.map(order => (
          <div key={order._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            
            {/* Subtle Gradient Glow at top of card */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: order.progressPercentage === 100 ? 'var(--color-success)' : 'linear-gradient(90deg, var(--color-gold-primary), var(--color-gold-dark))' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <h4 style={{ fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '1px', fontSize: '1.1rem' }}>{order.orderNumber}</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gold-primary)', fontWeight: 600, letterSpacing: '0.5px', background: 'rgba(212, 175, 55, 0.1)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)' }}>
                Est: {new Date(order.estimatedCompletionDate).toLocaleDateString()}
              </span>
            </div>
            
            <div>
              <p style={{ fontWeight: 500, fontSize: '1rem' }}>{order.customerId?.name || order.customerId?.customerName || 'Unknown Customer'}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Quotation Ref: {order.quotationId?.quotationNumber || 'N/A'}</p>
            </div>
            
            <div style={{ background: 'var(--color-bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                {getStatusIcon(order.status)} <span style={{ color: 'var(--color-text-primary)' }}>{order.status}</span>
              </div>
              
              {/* Premium Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: 'var(--color-bg-base)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <div style={{ 
                  width: `${order.progressPercentage}%`, 
                  height: '100%', 
                  background: order.progressPercentage === 100 ? 'var(--color-success)' : 'linear-gradient(90deg, var(--color-gold-dark), var(--color-gold-primary))',
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)'
                }} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
              <button onClick={() => router.push(`/orders/${order._id}/edit`)} className="btn btn-outline" style={{ flex: 1 }}>Details</button>
              <button onClick={() => router.push(`/orders/${order._id}/edit`)} className="btn btn-primary" style={{ flex: 1, gap: '0.5rem' }}>Update <ChevronRight size={16} /></button>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No orders found. Click "New Order" to create one.
          </div>
        )}
      </div>
    </div>
  );
}
