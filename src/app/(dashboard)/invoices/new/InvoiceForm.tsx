"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import StoreSelector from "@/components/ui/StoreSelector";
import SearchableSelect from "@/components/ui/SearchableSelect";
import toast from 'react-hot-toast';

export default function InvoiceForm({ customers, transporters }: { customers: any[], transporters?: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeId, setStoreId] = useState("");
  
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [settings, setSettings] = useState<any>(null);

  const [formData, setFormData] = useState({
    customerId: "",
    subtotal: 0,
    amountPaid: 0,
    paymentMethod: "UPI",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    transporterId: "",
    vehicleNumber: "",
    transportCompany: ""
  });

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => { if (!d.error) setSettings(d); });
    
    if (formData.customerId) {
      fetch(`/api/customers/${formData.customerId}/orders`)
        .then(r => r.json())
        .then(d => {
          if (d.orders) {
            setAvailableOrders(d.orders);
          }
        });
    } else {
      setAvailableOrders([]);
      setSelectedOrders([]);
    }
  }, [formData.customerId]);

  const handleOrderToggle = (orderId: string) => {
    let newSelection = [...selectedOrders];
    if (newSelection.includes(orderId)) {
      newSelection = newSelection.filter(id => id !== orderId);
    } else {
      newSelection.push(orderId);
    }
    setSelectedOrders(newSelection);

    // Calculate subtotal automatically
    let newSubtotal = 0;
    newSelection.forEach(id => {
      const order = availableOrders.find(o => o._id === id);
      if (order?.quotationId?.suggestedSellingPrice) {
        newSubtotal += order.quotationId.suggestedSellingPrice;
      }
    });

    setFormData(prev => ({ ...prev, subtotal: newSubtotal }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (selectedOrders.length === 0) {
      toast.error("Please select at least one product (order) for the invoice.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const cgstRate = settings ? settings.cgstRate / 100 : 0.09;
      const sgstRate = settings ? settings.sgstRate / 100 : 0.09;
      const igstRate = settings ? settings.igstRate / 100 : 0;
      
      const cgst = formData.subtotal * cgstRate;
      const sgst = formData.subtotal * sgstRate;
      const igst = formData.subtotal * igstRate;
      
      const totalAmount = formData.subtotal + cgst + sgst + igst;
      const balanceDue = Math.max(0, totalAmount - formData.amountPaid);
      let paymentStatus = "Pending";
      if (balanceDue === 0) paymentStatus = "Paid";
      else if (formData.amountPaid > 0) paymentStatus = "Partial";

      const payload = {
        customerId: formData.customerId,
        orders: selectedOrders,
        subtotal: formData.subtotal,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        totalAmount: totalAmount,
        amountPaid: formData.amountPaid,
        balanceDue: balanceDue,
        paymentStatus: paymentStatus,
        paymentMethod: formData.paymentMethod,
        dueDate: formData.dueDate,
        vehicleNumber: formData.vehicleNumber,
        transportCompany: formData.transportCompany,
        storeId: storeId || undefined
      };

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      router.push("/invoices");
      router.refresh();
    } catch (err: any) {
      toast.error("Failed to generate invoice: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" style={{ padding: '2rem' }}>
      
      <StoreSelector value={storeId} onChange={setStoreId} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Select Customer *</label>
          <SearchableSelect 
            options={customers.map(c => ({ value: c._id, label: `${c.customerName} (${c.mobileNumber})` }))}
            value={formData.customerId}
            onChange={(val) => {
              setFormData({...formData, customerId: val, subtotal: 0});
              setSelectedOrders([]);
            }}
            placeholder="Search and Choose Customer..."
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Due Date</label>
          <input 
            type="date" 
            className="premium-input" 
            value={formData.dueDate} 
            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            required
          />
        </div>
        
        {/* Products (Orders) Selection Block */}
        <div style={{ gridColumn: '1 / -1', background: 'var(--color-bg-elevated)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <label className="text-sm font-medium" style={{ display: 'block', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Select Products (Orders) for this Invoice *</label>
          {!formData.customerId ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Please select a customer first to load available products.</p>
          ) : availableOrders.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>No orders found for this customer.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {availableOrders.map(order => {
                const isSelected = selectedOrders.includes(order._id);
                const price = order.quotationId?.suggestedSellingPrice || 0;
                const prodName = order.quotationId?.measurementId?.productType || 'Unknown Product';
                return (
                  <label key={order._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: isSelected ? 'rgba(212, 175, 55, 0.1)' : 'var(--color-bg-base)', border: isSelected ? '1px solid var(--color-gold-primary)' : '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => handleOrderToggle(order._id)}
                      style={{ accentColor: 'var(--color-gold-primary)', width: '18px', height: '18px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>{order.orderNumber} <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>- {prodName}</span></p>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      ₹{price.toLocaleString()}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Base Price (SubTotal without GST) ₹</label>
          <input 
            type="number" 
            className="premium-input" 
            value={formData.subtotal || ''} 
            onChange={(e) => setFormData({...formData, subtotal: Number(e.target.value)})}
            required
            min="0"
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Amount Paid (Advance) ₹</label>
          <input 
            type="number" 
            className="premium-input" 
            value={formData.amountPaid || ''} 
            onChange={(e) => setFormData({...formData, amountPaid: Number(e.target.value)})}
            min="0"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Payment Method</label>
          <select 
            className="premium-input" 
            value={formData.paymentMethod}
            onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
          >
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Select Transporter (Optional)</label>
          <select 
            className="premium-input" 
            value={formData.transporterId}
            onChange={(e) => {
              const tid = e.target.value;
              const transporter = transporters?.find(t => t._id === tid);
              if (transporter) {
                setFormData({
                  ...formData, 
                  transporterId: tid,
                  vehicleNumber: transporter.vehicleNumber || formData.vehicleNumber,
                  transportCompany: transporter.name || formData.transportCompany
                });
              } else {
                setFormData({...formData, transporterId: tid});
              }
            }}
          >
            <option value="">-- Custom Transporter --</option>
            {transporters?.map(t => (
              <option key={t._id} value={t._id}>{t.name} {t.vehicleNumber ? `(${t.vehicleNumber})` : ''}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Vehicle Number</label>
          <input 
            type="text" 
            className="premium-input" 
            placeholder="e.g. AP 09 XY 1234"
            value={formData.vehicleNumber} 
            onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Transport Details</label>
          <input 
            type="text" 
            className="premium-input" 
            placeholder="e.g. Driver Name, Transport Co."
            value={formData.transportCompany} 
            onChange={(e) => setFormData({...formData, transportCompany: e.target.value})}
          />
        </div>
      </div>

      {/* Summary Box */}
      <div style={{ background: 'var(--color-bg-base)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>GST ({settings ? (settings.cgstRate + settings.sgstRate + settings.igstRate) : 18}%)</p>
          <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>₹{((formData.subtotal || 0) * (settings ? (settings.cgstRate + settings.sgstRate + settings.igstRate) / 100 : 0.18)).toLocaleString()}</p>
        </div>
        <div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Total Amount</p>
          <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-gold-primary)' }}>₹{((formData.subtotal || 0) * (1 + (settings ? (settings.cgstRate + settings.sgstRate + settings.igstRate) / 100 : 0.18))).toLocaleString()}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Balance Due</p>
          <p style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--color-text-primary)' }}>₹{Math.max(0, ((formData.subtotal || 0) * (1 + (settings ? (settings.cgstRate + settings.sgstRate + settings.igstRate) / 100 : 0.18))) - (formData.amountPaid || 0)).toLocaleString()}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
        <button type="button" onClick={() => router.back()} className="btn btn-outline">Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ gap: '0.5rem' }}>
          <Save size={18} /> {isSubmitting ? 'Generating...' : 'Generate Invoice'}
        </button>
      </div>
    </form>
  );
}
