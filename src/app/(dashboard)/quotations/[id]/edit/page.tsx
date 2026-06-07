"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import toast from 'react-hot-toast';

export default function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/quotations/${id}`)
      .then(res => res.json())
      .then(data => {
        setQuote(data);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/quotations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: quote.status,
        finalSellingPrice: quote.finalSellingPrice
      })
    });
    if (res.ok) {
      router.push("/quotations");
      router.refresh();
    } else {
      toast.error("Failed to update quotation");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!quote) return <div className="p-8">Quotation not found</div>;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/quotations" className="btn btn-outline" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Edit Quotation</h3>
          <p className="text-secondary">{quote.quotationNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card flex flex-col gap-6">
        <div className="form-group">
          <label className="form-label">Customer</label>
          <input type="text" className="premium-input" value={quote.customerId?.customerName || "Unknown"} disabled />
        </div>

        <div className="form-group">
          <label className="form-label">Final Selling Price (₹)</label>
          <input 
            type="number" 
            className="premium-input" 
            value={quote.finalSellingPrice}
            onChange={e => setQuote({...quote, finalSellingPrice: Number(e.target.value)})}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select 
            className="premium-input"
            value={quote.status}
            onChange={e => setQuote({...quote, status: e.target.value})}
          >
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          <Save size={18} /> Save Changes
        </button>
      </form>
    </div>
  );
}
