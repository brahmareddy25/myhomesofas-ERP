"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, EyeOff } from "lucide-react";
import toast from 'react-hot-toast';

export default function StoreForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    storeName: initialData?.storeName || "",
    managerName: initialData?.managerName || "",
    contactNumber: initialData?.contactNumber || "",
    isActive: initialData !== undefined ? initialData.isActive : true,
    gstNumber: initialData?.gstNumber || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    pincode: initialData?.pincode || "",
    username: initialData?.username || "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = initialData ? `/api/stores/${initialData._id}` : "/api/stores";
      const method = initialData ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Failed to save store");
      
      router.push("/admin/stores");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error saving store.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Store Name</label>
          <input required type="text" className="premium-input" value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Manager Name</label>
          <input required type="text" className="premium-input" value={formData.managerName} onChange={(e) => setFormData({...formData, managerName: e.target.value})} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Contact Number</label>
          <input required type="text" className="premium-input" value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">GST Number</label>
          <input type="text" className="premium-input" value={formData.gstNumber} onChange={(e) => setFormData({...formData, gstNumber: e.target.value})} />
        </div>

      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label className="text-sm font-medium">Full Address</label>
        <input required type="text" className="premium-input" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">City</label>
          <input type="text" className="premium-input" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">State</label>
          <input type="text" className="premium-input" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Pincode</label>
          <input type="text" className="premium-input" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
        </div>
      </div>

      <div style={{ padding: '1.5rem', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-gold-primary)' }}>Store Credentials</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="text-sm font-medium">Username (for Login)</label>
            <input type="text" className="premium-input" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} placeholder="e.g. kakinada_store" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="text-sm font-medium">{initialData ? "New Password (leave blank to keep current)" : "Password"}</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                className="premium-input" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                style={{ width: '100%', paddingRight: '2.5rem' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input 
          type="checkbox" 
          checked={formData.isActive} 
          onChange={(e) => setFormData({...formData, isActive: e.target.checked})} 
          style={{ width: '1rem', height: '1rem', accentColor: 'var(--color-gold-primary)' }}
        />
        <label className="text-sm font-medium">Store is Active</label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
        <button type="button" onClick={() => router.back()} className="btn btn-outline" disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="btn btn-primary" style={{ gap: '0.5rem' }} disabled={isSubmitting}>
          <Save size={18} /> {isSubmitting ? "Saving..." : "Save Store"}
        </button>
      </div>
    </form>
  );
}
