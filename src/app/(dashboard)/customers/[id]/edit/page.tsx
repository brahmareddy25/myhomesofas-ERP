"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { motion } from "framer-motion";
import toast from 'react-hot-toast';

import { use } from "react";

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/customers/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.customer) {
          setCustomer(data.customer);
        } else {
          setError("Failed to load customer");
        }
      })
      .catch(err => setError(err.message));
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/customers/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      router.push(`/customers/${resolvedParams.id}`);
      router.refresh();
    } catch (err: any) {
      toast.error("Failed to update customer: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!customer) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href={`/customers/${resolvedParams.id}`} className="btn btn-outline" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Edit Customer Profile</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Update {customer.customerName}'s information.</p>
        </div>
      </div>

      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card" 
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          <div className="premium-input-group">
            <input type="text" name="customerName" className="premium-input" value={customer.customerName || ""} onChange={handleChange} required placeholder=" " />
            <label className="premium-label">Full Name *</label>
          </div>

          <div className="premium-input-group">
            <input type="tel" name="mobileNumber" className="premium-input" value={customer.mobileNumber || ""} onChange={handleChange} required placeholder=" " />
            <label className="premium-label">Primary Mobile *</label>
          </div>

          <div className="premium-input-group">
            <input type="tel" name="alternateMobileNumber" className="premium-input" value={customer.alternateMobileNumber || ""} onChange={handleChange} placeholder=" " />
            <label className="premium-label">Alternate Mobile</label>
          </div>

          <div className="premium-input-group">
            <input type="email" name="emailAddress" className="premium-input" value={customer.emailAddress || ""} onChange={handleChange} placeholder=" " />
            <label className="premium-label">Email Address</label>
          </div>

          <div className="premium-input-group">
            <input type="number" name="age" className="premium-input" value={customer.age || ""} onChange={handleChange} placeholder=" " />
            <label className="premium-label">Age</label>
          </div>

          <div className="premium-input-group">
            <select name="gender" className="premium-input" value={customer.gender || ""} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <label className="premium-label">Gender</label>
          </div>
        </div>

        <h4 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Location Details</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <div className="premium-input-group">
            <textarea name="fullAddress" className="premium-input" value={customer.fullAddress || ""} onChange={handleChange} required rows={2} placeholder=" " style={{ resize: 'none' }}></textarea>
            <label className="premium-label">Complete Street Address *</label>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div className="premium-input-group">
            <input type="text" name="city" className="premium-input" value={customer.city || ""} onChange={handleChange} required placeholder=" " />
            <label className="premium-label">City *</label>
          </div>

          <div className="premium-input-group">
            <input type="text" name="state" className="premium-input" value={customer.state || ""} onChange={handleChange} required placeholder=" " />
            <label className="premium-label">State *</label>
          </div>

          <div className="premium-input-group">
            <input type="text" name="pincode" className="premium-input" value={customer.pincode || ""} onChange={handleChange} required placeholder=" " />
            <label className="premium-label">Pincode *</label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Link href={`/customers/${resolvedParams.id}`} className="btn btn-outline">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ gap: '0.5rem' }}>
            <Save size={18} /> {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
