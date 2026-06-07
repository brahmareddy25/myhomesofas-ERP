"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import toast from 'react-hot-toast';

export default function DisburseForm({ employee }: { employee: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    month: currentMonth,
    year: currentYear,
    baseSalary: employee.baseSalary || 0,
    bonus: 0,
    deductions: 0,
    remarks: ""
  });

  const netPay = Math.max(0, formData.baseSalary + formData.bonus - formData.deductions);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        employeeId: employee._id,
        storeId: employee.storeId?._id || employee.storeId, // Ensure it's ID
        ...formData,
        netPay: netPay,
        paymentDate: new Date(),
        status: 'Paid'
      };

      const res = await fetch("/api/payslips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success("Salary successfully disbursed!");
      router.push(`/employees/${employee._id}`);
      router.refresh();
    } catch (err: any) {
      toast.error("Failed to process disbursement: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" style={{ padding: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Pay Period (Month)</label>
          <select 
            className="premium-input" 
            value={formData.month}
            onChange={(e) => setFormData({...formData, month: e.target.value})}
          >
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Pay Period (Year)</label>
          <input 
            type="number" 
            className="premium-input" 
            value={formData.year} 
            onChange={(e) => setFormData({...formData, year: Number(e.target.value)})}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Base Salary ₹</label>
          <input 
            type="number" 
            className="premium-input" 
            value={formData.baseSalary || ''} 
            onChange={(e) => setFormData({...formData, baseSalary: Number(e.target.value)})}
            required
            min="0"
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium">Bonus / Incentives ₹</label>
          <input 
            type="number" 
            className="premium-input" 
            value={formData.bonus || ''} 
            onChange={(e) => setFormData({...formData, bonus: Number(e.target.value)})}
            min="0"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium text-red-500">Deductions (Unpaid Leaves, Advances) ₹</label>
          <input 
            type="number" 
            className="premium-input" 
            value={formData.deductions || ''} 
            onChange={(e) => setFormData({...formData, deductions: Number(e.target.value)})}
            min="0"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="text-sm font-medium text-gold">Net Payable Amount ₹</label>
          <input 
            type="number" 
            className="premium-input" 
            value={netPay.toFixed(2)} 
            disabled
            style={{ fontWeight: 600, color: 'var(--color-gold-primary)', backgroundColor: 'var(--color-surface-50)' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
        <label className="text-sm font-medium">Remarks / Description</label>
        <textarea 
          className="premium-input" 
          rows={3}
          placeholder="E.g., Added performance bonus for 5 sales this month."
          value={formData.remarks}
          onChange={(e) => setFormData({...formData, remarks: e.target.value})}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
        <button type="button" onClick={() => router.back()} className="btn btn-outline">Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ gap: '0.5rem' }}>
          <Save size={18} /> {isSubmitting ? 'Processing...' : `Disburse ₹${netPay.toLocaleString()}`}
        </button>
      </div>
    </form>
  );
}
