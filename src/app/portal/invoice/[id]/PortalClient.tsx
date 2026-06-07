"use client";

import { useEffect, useState, useRef } from "react";
import { Download, FileText, CheckCircle } from "lucide-react";
import toast from 'react-hot-toast';
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export default function PortalClient({ invoice }: { invoice: any }) {
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const hasTriggeredRef = useRef(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const generatePDF = async () => {
    if (generating) return;
    setGenerating(true);
    try {
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
      const store = invoice.storeId || {};
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
      doc.text(`Invoice No: ${invoice.invoiceNumber}`, 140, 40);
      const validOrders = (invoice.orders || []).filter(Boolean);
      doc.text(`Order Ref: ${validOrders.length > 0 ? validOrders.map((o:any)=>o.orderNumber || "Unknown").join(', ') : (invoice.orderId?.orderNumber || "Direct")}`, 140, 46);
      doc.text(`Date: ${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : "N/A"}`, 140, 52);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 60, 190, 60);
      
      // Customer and Transport Details
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Bill To:", 20, 70);
      doc.setFont("helvetica", "normal");
      const cust = invoice.customerId || {};
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
      doc.text(`Vehicle No: ${invoice.vehicleNumber || "N/A"}`, 110, 78);
      doc.text(`Transport Co: ${invoice.transportCompany || "N/A"}`, 110, 85);
      doc.text(`Payment Status: ${invoice.paymentStatus}`, 110, 91);
      
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

      const itemsToProcess = (invoice.orders || []).filter(Boolean);
      if (itemsToProcess.length > 0) {
        itemsToProcess.forEach((ord: any) => {
           let invoiceDesc = `Order: ${ord.orderNumber || "Unknown"}`;
           if (ord.quotationId && ord.quotationId.measurementId) {
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
        doc.text(`INR ${invoice.subtotal?.toLocaleString()}`, 160, currentY);
        currentY += 10;
      }
      
      doc.line(20, currentY + 5, 190, currentY + 5);
      
      // Summary
      let summaryY = currentY + 15;
      doc.setFont("helvetica", "normal");
      doc.text("Sum of Products Cost (Without GST):", 80, summaryY);
      doc.text(`INR ${invoice.subtotal?.toLocaleString()}`, 160, summaryY);
      summaryY += 10;
      
      const totalGst = (invoice.cgstAmount || 0) + (invoice.sgstAmount || 0) + (invoice.igstAmount || 0);
      doc.text("Sum of GST:", 80, summaryY);
      doc.text(`INR ${totalGst.toLocaleString()}`, 160, summaryY);
      summaryY += 10;
      
      doc.setFont("helvetica", "bold");
      doc.text("Total Amount:", 80, summaryY);
      doc.text(`INR ${invoice.totalAmount?.toLocaleString()}`, 160, summaryY);
      summaryY += 10;
      
      doc.setFont("helvetica", "normal");
      doc.text("Amount Paid:", 80, summaryY);
      doc.text(`INR ${invoice.amountPaid?.toLocaleString()}`, 160, summaryY);
      summaryY += 10;
      
      doc.setFont("helvetica", "bold");
      doc.text("Amount Yet To Pay:", 80, summaryY);
      doc.setTextColor(239, 68, 68); // Red
      doc.text(`INR ${invoice.balanceDue?.toLocaleString()}`, 160, summaryY);
      
      // Footer

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text("Please make all checks payable to My Home Sofas.", 20, 270);
      doc.text("Thank you for your business!", 20, 280);
      
      // Add QR Code to PDF
      try {
        const qrUrl = `${window.location.origin}/portal/invoice/${invoice._id}`;
        const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 0 });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Scan to View", 175, 258, { align: "center" });
        doc.addImage(qrDataUrl, 'PNG', 160, 260, 30, 30);
      } catch (e) {
        console.log("QR Code for PDF generation skipped.", e);
      }

      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(blobUrl);

      // Try auto-download
      setTimeout(() => {
        if (linkRef.current) {
          linkRef.current.click();
        }
      }, 500);

    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    // Only trigger once
    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      generatePDF();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-[#141414] border border-[#2a2a2a] rounded-2xl p-8 shadow-2xl">
        <div className="w-16 h-16 bg-[rgba(212,175,55,0.1)] rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText size={32} className="text-gold" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Invoice {invoice.invoiceNumber}</h1>
        
        {generating ? (
           <div className="my-8 flex flex-col items-center">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold mb-4"></div>
             <p className="text-gold">Preparing your document...</p>
           </div>
        ) : pdfUrl ? (
           <div className="my-8 flex flex-col items-center">
             <CheckCircle size={48} className="text-green-500 mb-4" />
             <p className="text-gray-300 mb-6">Your document is ready!</p>
             
             {/* Hidden auto-download link */}
             <a 
               ref={linkRef} 
               href={pdfUrl} 
               download={`${invoice.invoiceNumber}_Invoice.pdf`} 
               style={{ display: 'none' }}
             />

             {/* Visible fallback link */}
             <a 
               href={pdfUrl} 
               download={`${invoice.invoiceNumber}_Invoice.pdf`}
               className="w-full flex items-center justify-center gap-3 bg-gold hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-yellow-900/20"
             >
               <Download size={20} />
               Save PDF to Device
             </a>
           </div>
        ) : (
           <div className="my-8">
             <p className="text-red-400 mb-4">Failed to prepare document.</p>
             <button onClick={generatePDF} className="btn btn-outline text-white border-white">
               Try Again
             </button>
           </div>
        )}
      </div>
    </div>
  );
}
