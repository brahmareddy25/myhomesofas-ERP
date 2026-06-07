"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import StoreSelector from "@/components/ui/StoreSelector";
import toast from 'react-hot-toast';

export default function ExpenseForm({ stores, role }: { stores: any[], role: string }) {
  const router = useRouter();
  const [storeId, setStoreId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    storeId: stores.length === 1 ? stores[0]._id : "",
    category: "Rent",
    description: "",
    amount: 0,
    dateIncurred: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Failed to submit expense");
      
      router.push("/expenses");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error submitting expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {role === "Admin" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="text-sm font-medium">Store</label>
            <select required className="premium-input" value={formData.storeId} onChange={(e) => setFormData({...formData, storeId: e.target.value})}>
              <option value="">Select Store</option>
              {stores.map(s => <option key={s._id} value={s._id}>{s.storeName}</option>)}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Category</label>
          <select required className="premium-input" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
            {['Rent', 'Electricity', 'Water', 'Maintenance', 'Logistics', 'Marketing', 'Office Supplies', 'Other'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Amount (INR)</label>
          <input required type="number" min="0" className="premium-input" value={formData.amount || ''} onChange={(e) => setFormData({...formData, amount: e.target.value ? parseFloat(e.target.value) : 0})} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Date Incurred</label>
          <input required type="date" className="premium-input" value={formData.dateIncurred} onChange={(e) => setFormData({...formData, dateIncurred: e.target.value})} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label className="text-sm font-medium">Description</label>
        <textarea required className="premium-input" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
        <button type="button" onClick={() => router.back()} className="btn btn-outline" disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="btn btn-primary" style={{ gap: '0.5rem' }} disabled={isSubmitting}>
          <Save size={18} /> {isSubmitting ? "Submitting..." : "Submit Expense"}
        </button>
      </div>
    </form>
  );
}
