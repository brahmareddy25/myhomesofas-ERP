"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, User, Briefcase, DollarSign, Calendar, MapPin } from "lucide-react";
import StoreSelector from "@/components/ui/StoreSelector";
import toast from 'react-hot-toast';

export default function EmployeeForm({ initialData, employeeId }: { initialData?: any, employeeId?: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeId, setStoreId] = useState("");

  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [designation, setDesignation] = useState(initialData?.designation || "Sales Executive");
  const [contactNumber, setContactNumber] = useState(initialData?.contactNumber || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [dateOfJoining, setDateOfJoining] = useState(initialData?.dateOfJoining ? new Date(initialData.dateOfJoining).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [baseSalary, setBaseSalary] = useState(initialData?.baseSalary || "");
  const [salaryType, setSalaryType] = useState(initialData?.salaryType || "Monthly");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        firstName,
        lastName,
        designation,
        contactNumber,
        address,
        dateOfJoining: new Date(dateOfJoining),
        baseSalary: Number(baseSalary),
        salaryType,
        isActive,
        storeId: storeId || undefined
      };

      const url = employeeId ? `/api/employees/${employeeId}` : "/api/employees";
      const method = employeeId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`Employee ${employeeId ? 'Updated' : 'Created'} Successfully!`);
        router.push("/employees");
      } else {
        const error = await res.json();
        toast.error("Error saving employee: " + error.error);
      }
    } catch (err) {
      toast.error("Failed to connect to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {!employeeId && <StoreSelector value={storeId} onChange={setStoreId} />}
      
      {/* Personal Details */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <User size={20} className="text-gold" /> Personal Information
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="premium-input-group">
            <input type="text" className="premium-input" required value={firstName} onChange={e => setFirstName(e.target.value)} />
            <label className="premium-label">First Name *</label>
          </div>
          <div className="premium-input-group">
            <input type="text" className="premium-input" required value={lastName} onChange={e => setLastName(e.target.value)} />
            <label className="premium-label">Last Name *</label>
          </div>
          <div className="premium-input-group">
            <input type="tel" className="premium-input" required value={contactNumber} onChange={e => setContactNumber(e.target.value)} />
            <label className="premium-label">Contact Number *</label>
          </div>
          <div className="premium-input-group">
            <input type="text" className="premium-input" required value={address} onChange={e => setAddress(e.target.value)} />
            <label className="premium-label">Address *</label>
          </div>
        </div>
      </div>

      {/* Employment Details */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <Briefcase size={20} className="text-gold" /> Employment Details
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="premium-input-group">
            <select className="premium-input" value={designation} onChange={e => setDesignation(e.target.value)}>
              <option value="Manager">Manager</option>
              <option value="Sales Executive">Sales Executive</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Tailor">Tailor</option>
              <option value="Delivery Staff">Delivery Staff</option>
              <option value="Helper">Helper</option>
            </select>
            <label className="premium-label">Designation</label>
          </div>
          <div className="premium-input-group">
            <input type="date" className="premium-input" required value={dateOfJoining} onChange={e => setDateOfJoining(e.target.value)} />
            <label className="premium-label">Date of Joining *</label>
          </div>
          
          <div className="premium-input-group">
            <input type="number" className="premium-input" required value={baseSalary} onChange={e => setBaseSalary(e.target.value)} />
            <label className="premium-label">Base Salary *</label>
          </div>
          <div className="premium-input-group">
            <select className="premium-input" value={salaryType} onChange={e => setSalaryType(e.target.value)}>
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
              <option value="Daily Wage">Daily Wage</option>
            </select>
            <label className="premium-label">Salary Type</label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-gold)' }} />
              Active Employee
            </label>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ gap: '0.5rem', width: '250px' }}>
          <Save size={18} /> {isSubmitting ? 'Saving...' : employeeId ? 'Update Employee' : 'Save Employee'}
        </button>
      </div>
    </form>
  );
}
