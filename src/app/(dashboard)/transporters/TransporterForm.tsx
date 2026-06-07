"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import toast from 'react-hot-toast';

export default function TransporterForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    contactPerson: initialData?.contactPerson || "",
    phone: initialData?.phone || "",
    vehicleNumber: initialData?.vehicleNumber || "",
    baseRatePerKm: initialData?.baseRatePerKm || 0,
    isActive: initialData !== undefined ? initialData.isActive : true,
    gstNumber: initialData?.gstNumber || "",
    address: initialData?.address || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = initialData ? `/api/transporters/${initialData._id}` : "/api/transporters";
      const method = initialData ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Failed to save transporter");
      
      router.push("/transporters");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error saving transporter. Admin privileges required.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Logistics Company Name</label>
          <input required type="text" className="premium-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Contact Person</label>
          <input required type="text" className="premium-input" value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Phone</label>
          <input required type="text" className="premium-input" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Vehicle Number</label>
          <input type="text" className="premium-input" value={formData.vehicleNumber} onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Base Rate (per km)</label>
          <input type="number" min="0" className="premium-input" value={formData.baseRatePerKm} onChange={(e) => setFormData({...formData, baseRatePerKm: parseFloat(e.target.value)})} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">GST Number</label>
          <input type="text" className="premium-input" value={formData.gstNumber} onChange={(e) => setFormData({...formData, gstNumber: e.target.value})} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label className="text-sm font-medium">Address</label>
        <input required type="text" className="premium-input" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input 
          type="checkbox" 
          checked={formData.isActive} 
          onChange={(e) => setFormData({...formData, isActive: e.target.checked})} 
          style={{ width: '1rem', height: '1rem', accentColor: 'var(--color-gold-primary)' }}
        />
        <label className="text-sm font-medium">Transporter is Active</label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
        <button type="button" onClick={() => router.back()} className="btn btn-outline" disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="btn btn-primary" style={{ gap: '0.5rem' }} disabled={isSubmitting}>
          <Save size={18} /> {isSubmitting ? "Saving..." : "Save Transporter"}
        </button>
      </div>
    </form>
  );
}
