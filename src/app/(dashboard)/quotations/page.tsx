"use client";

import { FileText, Download, Edit, Plus, FileSignature } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from 'react-hot-toast';

import { useSearchParams } from "next/navigation";
import ServerSearch from "@/components/ui/ServerSearch";
import ServerPagination from "@/components/ui/ServerPagination";
import { Suspense } from "react";

function QuotationsList() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const searchParams = useSearchParams();

  useEffect(() => {
    const page = searchParams?.get("page") || "1";
    const q = searchParams?.get("q") || "";
    
    fetch(`/api/quotations?page=${page}&q=${q}`)
      .then(res => res.json())
      .then(data => {
        if (data.quotations) {
          setQuotations(data.quotations);
          setPagination({ page: data.page, totalPages: data.totalPages, totalItems: data.totalItems });
        }
      });
  }, [searchParams]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Approved': return { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', border: 'var(--color-success)' };
      case 'Draft': return { bg: 'rgba(160, 160, 168, 0.1)', color: 'var(--color-text-secondary)', border: 'var(--color-text-secondary)' };
      case 'Sent': return { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-info)', border: 'var(--color-info)' };
      default: return { bg: 'transparent', color: 'var(--color-text-secondary)', border: 'transparent' };
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.6s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '1px' }}>Manage <span className="text-gold" style={{ fontWeight: 600 }}>Quotations</span></h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Generate and track premium pricing proposals.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <ServerSearch placeholder="Search by quote number, customer name, or phone..." />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Quotation #</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Customer</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Date Issued</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Amount</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Status</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((quote) => {
              const statusStyle = getStatusColor(quote.status);
              return (
                <tr key={quote._id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background var(--transition-fast)' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1.5rem', fontWeight: 600, color: 'var(--color-gold-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileSignature size={16} style={{ opacity: 0.7 }} /> {quote.quotationNumber}
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>{quote.customerId?.customerName || "Unknown"}</td>
                  <td style={{ padding: '1.5rem', color: 'var(--color-text-secondary)' }}>{new Date(quote.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>₹{quote.finalSellingPrice?.toLocaleString()}</td>
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
                      {quote.status}
                    </span>
                  </td>
                  <td style={{ padding: '1.5rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <Link href={`/quotations/${quote._id}/edit`} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }} title="Edit Proposal">
                      <Edit size={16} />
                    </Link>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }} 
                      title="Download PDF"
                      onClick={async () => {
                        try {
                          const { jsPDF } = await import('jspdf');
                          const doc = new jsPDF('p', 'mm', 'a4');
                          
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
                          doc.text("OFFICIAL QUOTATION", 105, 15, { align: "center" });

                          // Store / Brand Header
                          const store = quote.storeId || {};
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
                          
                          doc.setFontSize(10);
                          doc.setTextColor(0, 0, 0);
                          doc.text(`Quotation No: ${quote.quotationNumber}`, 140, 40);
                          doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, 140, 46);
                          if (quote.expectedDeliveryDate) {
                            doc.text(`Expected Delivery: ${new Date(quote.expectedDeliveryDate).toLocaleDateString()}`, 140, 52);
                          }
                          
                          doc.setDrawColor(200, 200, 200);
                          doc.line(20, 60, 190, 60);
                          
                          // Customer Details
                          doc.setFontSize(14);
                          doc.setFont("helvetica", "bold");
                          doc.text("Customer Details", 20, 70);
                          doc.setFontSize(10);
                          doc.setFont("helvetica", "normal");
                          const cust = quote.customerId || {};
                          doc.text(`Name: ${cust.customerName || "Unknown"}`, 20, 78);
                          doc.text(`Phone: ${cust.mobileNumber || "N/A"}`, 20, 85);
                          doc.text(`Email: ${cust.emailAddress || "N/A"}`, 110, 78);
                          
                          const addressStr = [cust.fullAddress, cust.city, cust.state, cust.pincode].filter(Boolean).join(", ");
                          const addressLines = doc.splitTextToSize(`Address: ${addressStr || "N/A"}`, 80);
                          doc.text(addressLines, 110, 85);
                          
                          const customerBoxHeight = Math.max(95, 85 + (addressLines.length * 5));
                          doc.line(20, customerBoxHeight, 190, customerBoxHeight);
                          
                          // Measurement Details
                          let currentY = customerBoxHeight + 10;
                          doc.setFontSize(14);
                          doc.setFont("helvetica", "bold");
                          doc.text("Product & Configuration Details", 20, currentY);
                          doc.setFontSize(10);
                          doc.setFont("helvetica", "normal");
                          const m = quote.measurementId || {};
                          currentY += 8;
                          
                          const isSofa = m.productType?.includes("Sofa");
                          const isBed = m.productType === "Bed";
                          const isMattress = m.productType === "Mattress";
                          const isTable = m.productType?.includes("Table");
                          const isChair = m.productType?.includes("Chair");

                          const detailsCol1: string[] = [];
                          const detailsCol2: string[] = [];

                          detailsCol1.push(`Product Type: ${m.productType || "Sofa"}`);
                          detailsCol1.push(`Dimensions: ${m.length||0}L x ${m.width||0}W x ${m.height||0}H ${m.unit||'cm'}`);

                          if (isSofa || isChair) {
                            detailsCol1.push(`Seat (W x D x H): ${m.seatWidth||0} x ${m.seatDepth||0} x ${m.seatHeight||0} ${m.unit||'cm'}`);
                            detailsCol1.push(`Backrest Height: ${m.backrestHeight||0} ${m.unit||'cm'}`);
                            if (isSofa) {
                                detailsCol1.push(`Cushion Thickness: ${m.cushionThickness||0} ${m.unit||'cm'}`);
                                detailsCol1.push(`Armrest Width: ${m.armrestWidth||0} ${m.unit||'cm'}`);
                                detailsCol1.push(`Handle Type: ${m.handleType || 'Standard'}`);
                            }
                            detailsCol2.push(`Leg Details: ${m.legType || 'Hidden'} (${m.legHeight||0} ${m.unit||'cm'})`);
                            detailsCol2.push(`Fabric/Color: ${m.colorCode || 'Standard'} | Catalog: ${m.catalog || 'Premium'}`);
                            detailsCol2.push(`Cushion Type: ${m.cushionType || "Standard"}`);
                            if (isSofa) {
                                detailsCol2.push(`Recliner: ${m.reclinerType || 'None'} (Seats: ${m.numberOfReclinerSeats || 0})`);
                                detailsCol2.push(`Addons: ${(m.premiumAddons || []).join(", ") || 'None'}`);
                                detailsCol2.push(`USB: ${m.hasUsbCharging?'Yes':'No'} | Cup Holder: ${m.hasCupHolder?'Yes':'No'}`);
                            }
                          } else if (isBed) {
                            detailsCol1.push(`Bed Headboard: ${m.headboardHeight||0} ${m.unit||'cm'}`);
                            detailsCol1.push(`Storage: ${m.hasStorage?'Yes':'No'}`);
                            detailsCol2.push(`Fabric/Color: ${m.colorCode || 'Standard'} | Catalog: ${m.catalog || 'Premium'}`);
                          } else if (isMattress) {
                            detailsCol2.push(`Mattress Material: ${m.cushionType || "Standard"}`);
                          }

                          const maxRows = Math.max(detailsCol1.length, detailsCol2.length);
                          for (let i = 0; i < maxRows; i++) {
                            if (detailsCol1[i]) doc.text(detailsCol1[i], 20, currentY + (i * 6));
                            if (detailsCol2[i]) doc.text(detailsCol2[i], 105, currentY + (i * 6));
                          }
                          
                          let dynamicY = currentY + (maxRows * 6) + 6;
                          if (isSofa && (m.productType?.includes("L Shape") || m.productType?.includes("U Shape") || m.productType?.includes("Sectional"))) {
                            const chaise = m.sideDimensions?.chaisePlacement || 'None';
                            doc.text(`Chaise: ${chaise}`, 20, dynamicY);
                            
                            const showLeft = chaise === 'Left Side' || m.productType?.includes("U Shape");
                            const showRight = chaise === 'Right Side' || m.productType?.includes("U Shape");

                            if (showLeft) {
                              doc.text(`Left Side: ${m.sideDimensions?.leftSideLength||0} (${m.sideDimensions?.leftSideType||'N/A'})`, 105, dynamicY);
                              dynamicY += 6;
                            }
                            if (showRight) {
                              doc.text(`Right Side: ${m.sideDimensions?.rightSideLength||0} (${m.sideDimensions?.rightSideType||'N/A'})`, 105, dynamicY);
                              dynamicY += 6;
                            }
                            if (!showLeft && !showRight) {
                              dynamicY += 6;
                            }
                          }
                          
                          doc.setFont("helvetica", "bold");
                          doc.text("Special Notes / Instructions:", 20, dynamicY);
                          doc.setFont("helvetica", "normal");
                          const notesLines = doc.splitTextToSize(m.specialNotes || "None", 170);
                          doc.text(notesLines, 20, dynamicY + 6);
                          
                          dynamicY += (notesLines.length * 5) + 5;

                          if (dynamicY > 200) {
                             doc.addPage();
                             dynamicY = 20;
                          }
                          
                          // 3D Views
                          if (m.previewImages && m.previewImages.isometric) {
                            doc.setFontSize(14);
                            doc.setFont("helvetica", "bold");
                            doc.text("3D Visualizations", 20, dynamicY);
                            dynamicY += 8;
                            
                            try {
                              if (m.previewImages.isometric) doc.addImage(m.previewImages.isometric, 'JPEG', 20, dynamicY, 50, 40);
                            } catch(e) { console.error("iso err", e); }
                            try {
                              if (m.previewImages.top) doc.addImage(m.previewImages.top, 'JPEG', 75, dynamicY, 50, 40);
                            } catch(e) { console.error("top err", e); }
                            try {
                              if (m.previewImages.front) doc.addImage(m.previewImages.front, 'JPEG', 130, dynamicY, 50, 40);
                            } catch(e) { console.error("front err", e); }
                              
                            doc.setFontSize(9);
                            doc.setFont("helvetica", "normal");
                            doc.text("Isometric View", 30, dynamicY + 45);
                            doc.text("Top View", 90, dynamicY + 45);
                            doc.text("Front View", 145, dynamicY + 45);
                            dynamicY += 55;
                          }

                          if (dynamicY > 230) {
                             doc.addPage();
                             dynamicY = 20;
                          }
                          
                          // Pricing
                          doc.setDrawColor(200, 200, 200);
                          doc.line(20, dynamicY, 190, dynamicY);
                          dynamicY += 10;
                          doc.setFontSize(14);
                          doc.setFont("helvetica", "bold");
                          doc.text("Commercial Proposal", 20, dynamicY);
                          dynamicY += 10;
                          doc.setFontSize(11);
                          doc.setFont("helvetica", "normal");
                          let quoteDesc = "Premium Bespoke Furniture Specification";
                          if (quote.measurementId) {
                            const m = quote.measurementId;
                            quoteDesc = `${m.productType || "Furniture"} ${m.length || 0} * ${m.width || 0} * ${m.height || 0} ${m.colorCode || ""}`;
                          }
                          doc.text(quoteDesc, 20, dynamicY);
                          doc.text(`INR ${quote.finalSellingPrice?.toLocaleString()}`, 160, dynamicY);
                          dynamicY += 10;
                          doc.setFont("helvetica", "bold");
                          doc.text("Total Proposed Value:", 110, dynamicY);
                          doc.text(`INR ${quote.finalSellingPrice?.toLocaleString()}`, 160, dynamicY);
                          
                          // Terms and Conditions
                          dynamicY += 15;
                          if (dynamicY > 260) {
                            doc.addPage();
                            dynamicY = 20;
                          }
                          doc.setFontSize(10);
                          doc.setFont("helvetica", "bold");
                          doc.text("Terms & Conditions:", 20, dynamicY);
                          dynamicY += 6;
                          doc.setFont("helvetica", "normal");
                          doc.setFontSize(9);
                          const termsLines = doc.splitTextToSize(quote.termsAndConditions || "Standard Manufacturing Terms Apply.", 170);
                          doc.text(termsLines, 20, dynamicY);
                          dynamicY += (termsLines.length * 5);
                          
                          // Signatures
                          let sigY = dynamicY + 40;
                          if (sigY > 280) {
                            doc.addPage();
                            sigY = 40;
                          }
                          doc.setFontSize(11);
                          doc.setFont("helvetica", "normal");
                          doc.text("Customer Signature", 30, sigY);
                          doc.line(20, sigY - 5, 80, sigY - 5);
                          
                          doc.text("My Home Sofas", 145, sigY);
                          doc.line(130, sigY - 5, 190, sigY - 5);
                          
                          doc.setFont("helvetica", "italic");
                          doc.setFontSize(10);
                          doc.text("Thank you for choosing My Home Sofas. This quotation is valid for 30 days.", 20, sigY + 10);
                          
                          doc.save(`${quote.quotationNumber}_Quotation.pdf`);
                        } catch (error) {
                          console.error("PDF generation failed", error);
                          toast.error("Failed to generate PDF. Check console.");
                        }
                      }}
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <ServerPagination currentPage={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.totalItems} />
      </div>
    </div>
  );
}

export default function QuotationsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <QuotationsList />
    </Suspense>
  );
}
