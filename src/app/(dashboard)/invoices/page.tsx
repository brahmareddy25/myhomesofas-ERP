"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Download, Plus, DollarSign, Search, QrCode, Copy } from "lucide-react";
import toast from 'react-hot-toast';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [latestInvoices, setLatestInvoices] = useState<any[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrInvoiceUrl, setQrInvoiceUrl] = useState<string>("");

  const generateQrCode = async (invoiceId: string) => {
    try {
      const qrcode = await import('qrcode');
      const url = `${window.location.origin}/portal/invoice/${invoiceId}`;
      const dataUrl = await qrcode.toDataURL(url, { width: 250, margin: 1 });
      setQrInvoiceUrl(url);
      setQrDataUrl(dataUrl);
      setQrModalOpen(true);
    } catch (err) {
      toast.error("Failed to generate QR Code");
    }
  };

  const handleDownloadPDF = async (inv: any) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      // Load Logo
      try {
        const logoImg = new window.Image();
        logoImg.src = "/logo.png";
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve; // Continue even if logo fails
        });
        doc.addImage(logoImg, 'PNG', 20, 15, 40, 25);
      } catch (e) {
        console.log("Logo load skipped.");
      }

      // Document Title Top Center
      doc.setFontSize(16);
      doc.setTextColor(212, 175, 55); // Gold
      doc.text("TAX INVOICE", 105, 15, { align: "center" });

      // Store / Brand Header
      const store = inv.storeId || {};
      const storeName = store.storeName || "MY HOME SOFAS";
      const storeAddress = [store.address, store.city, store.state, store.pincode].filter(Boolean).join(", ");
      const storeGst = store.gstNumber || "36ATMPC6443J2ZG";
      
      doc.setFontSize(22);
      doc.setTextColor(30, 58, 138); // Blue
      doc.text(storeName.toUpperCase(), 70, 25);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const addressLinesStore = doc.splitTextToSize(storeAddress, 65);
      doc.text(addressLinesStore, 70, 30);
      doc.text(`GSTIN: ${storeGst}`, 70, 30 + (addressLinesStore.length * 4));
      
      // Details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Invoice No: ${inv.invoiceNumber}`, 140, 40);
      doc.text(`Order Ref: ${inv.orders?.length > 0 ? inv.orders.map((o:any)=>o.orderNumber).join(', ') : "Direct"}`, 140, 46);
      doc.text(`Date: ${new Date(inv.createdAt).toLocaleDateString()}`, 140, 52);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 60, 190, 60);
      
      // Customer and Transport Details
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Bill To:", 20, 70);
      doc.setFont("helvetica", "normal");
      const cust = inv.customerId || {};
      doc.text(cust.customerName || "Unknown", 20, 78);
      const custAddress = [cust.fullAddress, cust.city, cust.state, cust.pincode].filter(Boolean).join(", ");
      let custY = 85;
      if (custAddress) {
        const addressLinesCust = doc.splitTextToSize(custAddress, 65);
        doc.text(addressLinesCust, 20, custY);
        custY += (addressLinesCust.length * 5);
      }
      doc.text(`Phone: ${cust.mobileNumber || "N/A"}`, 20, custY);
      
      doc.setFont("helvetica", "bold");
      doc.text("Dispatch & Transport:", 110, 70);
      doc.setFont("helvetica", "normal");
      doc.text(`Vehicle No: ${inv.vehicleNumber || "N/A"}`, 110, 78);
      doc.text(`Transport Co: ${inv.transportCompany || "N/A"}`, 110, 85);
      doc.text(`Payment Status: ${inv.paymentStatus}`, 110, 91);
      
      // Line Items
      const listStartY = Math.max(custY + 15, 105);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, listStartY, 190, listStartY);
      doc.setFont("helvetica", "bold");
      doc.text("Description", 20, listStartY + 8);
      doc.text("Total", 160, listStartY + 8);
      
      doc.line(20, listStartY + 13, 190, listStartY + 13);
      doc.setFont("helvetica", "normal");
      
      let currentY = listStartY + 22;

      if (inv.orders && inv.orders.length > 0) {
        inv.orders.forEach((ord: any) => {
            let invoiceDesc = `Order: ${ord.orderNumber}`;
            if (ord.quotationId?.measurementId) {
              const m = ord.quotationId.measurementId;
              invoiceDesc = `${m.productType || "Furniture"} ${m.length || 0} * ${m.width || 0} * ${m.height || 0} ${m.colorCode || ""}`;
            }
            const itemTotal = ord.quotationId?.suggestedSellingPrice || 0;
            doc.text(invoiceDesc, 20, currentY);
            doc.text(`INR ${itemTotal.toLocaleString()}`, 160, currentY);
            currentY += 10;
        });
      } else {
        doc.text("Bespoke Furniture Manufacturing", 20, currentY);
        doc.text(`INR ${inv.subtotal?.toLocaleString()}`, 160, currentY);
        currentY += 10;
      }
      
      doc.line(20, currentY + 5, 190, currentY + 5);
      
      // Summary
      let summaryY = currentY + 15;
      doc.setFont("helvetica", "normal");
      doc.text("Sum of Products Cost (Without GST):", 80, summaryY);
      doc.text(`INR ${inv.subtotal?.toLocaleString()}`, 160, summaryY);
      summaryY += 10;
      
      const totalGst = (inv.cgstAmount || 0) + (inv.sgstAmount || 0) + (inv.igstAmount || 0);
      doc.text("Sum of GST:", 80, summaryY);
      doc.text(`INR ${totalGst.toLocaleString()}`, 160, summaryY);
      summaryY += 10;
      
      doc.setFont("helvetica", "bold");
      doc.text("Total Amount:", 80, summaryY);
      doc.text(`INR ${inv.totalAmount?.toLocaleString()}`, 160, summaryY);
      summaryY += 10;
      
      doc.setFont("helvetica", "normal");
      doc.text("Amount Paid:", 80, summaryY);
      doc.text(`INR ${inv.amountPaid?.toLocaleString()}`, 160, summaryY);
      summaryY += 10;
      
      doc.setFont("helvetica", "bold");
      doc.text("Amount Yet To Pay:", 80, summaryY);
      doc.setTextColor(239, 68, 68); // Red
      doc.text(`INR ${inv.balanceDue?.toLocaleString()}`, 160, summaryY);
      
      // Footer

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text("Please make all checks payable to My Home Sofas.", 20, 270);
      doc.text("Thank you for your business!", 20, 280);
      
      // Add QR Code to PDF
      try {
        const qrcode = await import('qrcode');
        const qrUrl = `${window.location.origin}/portal/invoice/${inv._id}`;
        const qrDataUrl = await qrcode.toDataURL(qrUrl, { margin: 0 });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Scan to View", 175, 258, { align: "center" });
        doc.addImage(qrDataUrl, 'PNG', 160, 260, 30, 30);
      } catch (e) {
        console.log("QR Code for PDF generation skipped.", e);
      }

      doc.save(`${inv.invoiceNumber}_Invoice.pdf`);
    } catch (error) {
      console.error("PDF generation failed", error);
      toast.error("Failed to generate PDF. Check console.");
    }
  };

  const submitPayment = () => {
    if (!selectedInvoiceForPayment) return;
    const numAmount = Number(paymentAmount);
    if (isNaN(numAmount) || numAmount <= 0) return toast.error("Invalid amount");
    if (numAmount > selectedInvoiceForPayment.balanceDue) return toast.error("Amount exceeds balance due");
    
    const newBalance = selectedInvoiceForPayment.balanceDue - numAmount;
    const newStatus = newBalance === 0 ? "Paid" : "Partial";
    
    fetch(`/api/invoices/${selectedInvoiceForPayment._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ balanceDue: newBalance, paymentStatus: newStatus })
    }).then(res => {
      if (res.ok) {
        setPaymentModalOpen(false);
        setPaymentAmount("");
        fetchInvoices();
      } else {
        toast.error("Failed to update payment");
      }
    });
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const fetchInvoices = (query = "") => {
    setIsSearching(true);
    fetch(`/api/invoices${query ? `?search=${encodeURIComponent(query)}` : ''}`)
      .then(res => res.json())
      .then(data => {
        if (data.invoices) setInvoices(data.invoices);
        setIsSearching(false);
      })
      .catch(() => setIsSearching(false));

    if (!query) {
      fetch('/api/invoices?latest=true')
        .then(res => res.json())
        .then(data => {
          if (data.invoices) setLatestInvoices(data.invoices);
        });
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Paid': return { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', border: 'var(--color-success)' };
      case 'Overdue': return { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', border: 'var(--color-error)' };
      case 'Partial': return { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)', border: 'var(--color-warning)' };
      default: return { bg: 'rgba(160, 160, 168, 0.1)', color: 'var(--color-text-secondary)', border: 'var(--color-text-secondary)' };
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.6s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '1px' }}>Tax <span className="text-gold" style={{ fontWeight: 600 }}>Invoices</span></h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Manage official billing and payment collections.</p>
        </div>
        <Link href="/invoices/new" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={18} /> Generate Invoice
        </Link>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div className="premium-input-group" style={{ flex: 1, marginBottom: 0 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              className="premium-input" 
              style={{ paddingLeft: '3rem' }}
              placeholder="Search Invoice No or Customer Name to find Paid history..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchInvoices(searchQuery)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => fetchInvoices(searchQuery)} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          {searchQuery && (
            <button className="btn btn-outline" onClick={() => { setSearchQuery(""); fetchInvoices(""); }}>
              Clear
            </button>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Invoice #</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Customer</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Total Amount</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Balance Due</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Status</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const statusStyle = getStatusColor(inv.paymentStatus);
              return (
                <tr key={inv._id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background var(--transition-fast)' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ color: 'var(--color-gold-primary)' }}>{inv.invoiceNumber}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Ref: {inv.orderId?.orderNumber || "Direct"}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>{inv.customerId?.customerName || "Unknown"}</td>
                  <td style={{ padding: '1.5rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                    {inv.orders && inv.orders.length > 0 
                      ? inv.orders.map((o: any) => o.orderNumber).join(', ') 
                      : (inv.orderId?.orderNumber || "N/A")}
                  </td>
                  <td style={{ padding: '1.5rem', fontWeight: 600, color: inv.balanceDue === 0 ? 'var(--color-text-secondary)' : 'var(--color-error)' }}>₹{inv.balanceDue?.toLocaleString()}</td>
                  <td style={{ padding: '1.5rem' }}>
                    <span style={{ 
                      padding: '0.35rem 0.85rem', 
                      borderRadius: 'var(--radius-full)', 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.border}`,
                      letterSpacing: '0.5px'
                    }}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '1.5rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--color-gold-primary)', borderColor: 'var(--color-gold-primary)' }} 
                      title="Share Portal QR"
                      onClick={() => generateQrCode(inv._id)}
                    >
                      <QrCode size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedInvoiceForPayment(inv);
                        setPaymentModalOpen(true);
                        setPaymentAmount("");
                      }}
                      className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', borderColor: 'var(--color-success)' }} title="Record Payment"
                    >
                      <DollarSign size={16} />
                    </button>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }} 
                      title="Download PDF"
                      onClick={() => handleDownloadPDF(inv)}
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
     </div>

      {/* Latest 3 Invoices Section */}
      {!searchQuery && latestInvoices.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-gold-primary)', marginBottom: '1rem', fontWeight: 600 }}>
            Recently Generated Invoices
          </h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}>
                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Invoice #</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Customer</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Amount</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Status</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {latestInvoices.map(inv => (
                    <tr key={inv._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '1rem', color: 'var(--color-gold-primary)', fontWeight: 600 }}>{inv.invoiceNumber}</td>
                      <td style={{ padding: '1rem', color: 'var(--color-text-primary)' }}>{inv.customerId?.customerName || "Unknown"}</td>
                      <td style={{ padding: '1rem', color: 'var(--color-text-primary)' }}>₹{inv.totalAmount?.toLocaleString()}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: 'var(--radius-full)', 
                          fontSize: '0.75rem',
                          backgroundColor: inv.paymentStatus === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: inv.paymentStatus === 'Paid' ? 'var(--color-success)' : 'var(--color-error)'
                        }}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--color-gold-primary)', borderColor: 'var(--color-gold-primary)' }} 
                          title="Share Portal QR"
                          onClick={() => generateQrCode(inv._id)}
                        >
                          <QrCode size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedInvoiceForPayment(inv);
                            setPaymentModalOpen(true);
                            setPaymentAmount("");
                          }}
                          className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', borderColor: 'var(--color-success)' }} title="Record Payment"
                        >
                          <DollarSign size={16} />
                        </button>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }} 
                          title="Download PDF"
                          onClick={() => handleDownloadPDF(inv)}
                        >
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalOpen && selectedInvoiceForPayment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-gold-primary)' }}>Record Payment</h3>
            <p style={{ marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Invoice: <strong style={{color:'white'}}>{selectedInvoiceForPayment.invoiceNumber}</strong></p>
            <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>Balance Due: <strong style={{color:'var(--color-error)'}}>₹{selectedInvoiceForPayment.balanceDue?.toLocaleString()}</strong></p>
            
            <div className="premium-input-group">
              <input 
                type="number" 
                className="premium-input" 
                placeholder=" "
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
              />
              <label className="premium-label">Amount Paid (₹)</label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setPaymentModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitPayment}>Save Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card text-center" style={{ width: '350px', maxWidth: '90%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-gold-primary)' }}>Share Invoice</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Scan this QR code to view and download the invoice.</p>
            
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR Code" style={{ margin: '0 auto', borderRadius: '8px', border: '2px solid var(--color-border)' }} />
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => {
                navigator.clipboard.writeText(qrInvoiceUrl);
                toast.success("Link copied!");
              }}>
                <Copy size={16} /> Copy Link
              </button>
              <button className="btn btn-outline" onClick={() => setQrModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
