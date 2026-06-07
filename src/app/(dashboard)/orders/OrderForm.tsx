"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, FileText, User, Calendar, Activity } from "lucide-react";
import StoreSelector from "@/components/ui/StoreSelector";
import SearchableSelect from "@/components/ui/SearchableSelect";
import toast from 'react-hot-toast';

export default function OrderForm({ initialData, orderId }: { initialData?: any, orderId?: string }) {
  const router = useRouter();
  const [storeId, setStoreId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [orderedQuotationIds, setOrderedQuotationIds] = useState<Set<string>>(new Set());

  const [customerId, setCustomerId] = useState(initialData?.customerId?._id || initialData?.customerId || "");
  const [quotationId, setQuotationId] = useState(initialData?.quotationId?._id || initialData?.quotationId || "");
  const [orderNumber, setOrderNumber] = useState(initialData?.orderNumber || "");
  const [status, setStatus] = useState(initialData?.status || "Order Confirmed");
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState(initialData?.estimatedCompletionDate ? new Date(initialData.estimatedCompletionDate).toISOString().split('T')[0] : "");
  const [assignedTeam, setAssignedTeam] = useState(initialData?.assignedTeam || "");
  const [progressPercentage, setProgressPercentage] = useState(initialData?.progressPercentage || 0);

  useEffect(() => {
    fetch("/api/customers").then(r => r.json()).then(d => {
      if(d.customers) setCustomers(d.customers);
    });
    fetch("/api/quotations").then(r => r.json()).then(d => {
      if(d.quotations) setQuotations(d.quotations);
    });
    fetch("/api/orders").then(r => r.json()).then(d => {
      if(d.orders) {
        const ids = new Set<string>();
        d.orders.forEach((o: any) => {
          if (o.quotationId?._id) ids.add(o.quotationId._id);
          else if (o.quotationId) ids.add(o.quotationId);
        });
        setOrderedQuotationIds(ids);
      }
    });
  }, []);

  const handleQuotationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setQuotationId(val);
    const selectedQuote = quotations.find(q => q._id === val);
    if (selectedQuote && selectedQuote.expectedDeliveryDate) {
      setEstimatedCompletionDate(new Date(selectedQuote.expectedDeliveryDate).toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        customerId,
        quotationId,
        orderNumber,
        status,
        estimatedCompletionDate: new Date(estimatedCompletionDate),
        assignedTeam,
        progressPercentage: Number(progressPercentage),
        storeId: storeId || undefined
      };

      const url = orderId ? `/api/orders/${orderId}` : "/api/orders";
      const method = orderId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`Order ${orderId ? 'Updated' : 'Created'} Successfully!`);
        router.push("/orders");
      } else {
        const error = await res.json();
        toast.error("Error saving order: " + error.error);
      }
    } catch (err) {
      toast.error("Failed to connect to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Store Selector */}
      {!initialData && <StoreSelector value={storeId} onChange={setStoreId} />}
      
      {/* Basics */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <FileText size={20} className="text-gold" /> Basic Details
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="premium-input-group" style={{ zIndex: 10 }}>
            <SearchableSelect 
              options={customers.map(c => ({ value: c._id, label: c.customerName || c.name }))}
              value={customerId}
              onChange={(val) => {
                setCustomerId(val);
                setQuotationId(""); // Reset quotation when customer changes
                setEstimatedCompletionDate("");
              }}
              placeholder="Search and Select Customer..."
              required
            />
            <label className="premium-label">Customer *</label>
          </div>
          <div className="premium-input-group">
            <select className="premium-input" required value={quotationId} onChange={handleQuotationChange} disabled={!customerId}>
              <option value="" disabled hidden>{customerId ? "Select Quotation" : "Select Customer First"}</option>
              {quotations
                .filter(q => (q.customerId?._id === customerId || q.customerId === customerId) && q.status === "Approved" && (!orderedQuotationIds.has(q._id) || quotationId === q._id))
                .map(q => <option key={q._id} value={q._id}>{q.quotationNumber}</option>)}
            </select>
            <label className="premium-label">Quotation *</label>
          </div>
          
          {orderId && (
            <div className="premium-input-group">
              <input type="text" className="premium-input" value={orderNumber} readOnly disabled />
              <label className="premium-label">Order Number</label>
            </div>
          )}
        </div>
      </div>

      {/* Status & Tracking */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <Activity size={20} className="text-gold" /> Status & Tracking
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="premium-input-group">
            <select className="premium-input" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="Order Confirmed">Order Confirmed</option>
              <option value="Material Procurement">Material Procurement</option>
              <option value="Production Started">Production Started</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Quality Check">Quality Check</option>
              <option value="Packing">Packing</option>
              <option value="Ready For Dispatch">Ready For Dispatch</option>
              <option value="Out For Delivery">Out For Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Completed">Completed</option>
            </select>
            <label className="premium-label">Status</label>
          </div>
          <div className="premium-input-group">
            <input type="date" className="premium-input" required value={estimatedCompletionDate} onChange={e => setEstimatedCompletionDate(e.target.value)} />
            <label className="premium-label">Estimated Completion *</label>
          </div>
          
          <div className="premium-input-group">
            <input type="text" className="premium-input" value={assignedTeam} onChange={e => setAssignedTeam(e.target.value)} />
            <label className="premium-label">Assigned Team</label>
          </div>
          <div className="premium-input-group">
            <input type="number" className="premium-input" min="0" max="100" value={progressPercentage} onChange={e => setProgressPercentage(e.target.value)} />
            <label className="premium-label">Progress Percentage (%)</label>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ gap: '0.5rem', width: '250px' }}>
          <Save size={18} /> {isSubmitting ? 'Saving...' : orderId ? 'Update Order' : 'Save Order'}
        </button>
      </div>
    </form>
  );
}
