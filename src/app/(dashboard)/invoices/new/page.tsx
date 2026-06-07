import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Transporter from "@/models/Transporter";
import InvoiceForm from "./InvoiceForm";

export default async function NewInvoicePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await dbConnect();
  
  const role = (session.user as any).role;
  const storeId = (session.user as any).storeId;

  const query = role === "Store" ? { storeId: storeId } : {};
  
  // Fetch customers to populate the dropdown
  const customers = await Customer.find(query).select('_id customerName mobileNumber').lean();
  const safeCustomers = customers.map(c => ({ _id: c._id.toString(), customerName: c.customerName, mobileNumber: c.mobileNumber }));

  // Fetch transporters to populate the dropdown
  const transporters = await Transporter.find({ isActive: true }).select('_id name vehicleNumber').lean();
  const safeTransporters = transporters.map(t => ({ _id: t._id.toString(), name: t.name, vehicleNumber: t.vehicleNumber }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '1px' }}>Generate <span className="text-gold" style={{ fontWeight: 600 }}>Invoice</span></h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Create a new tax invoice for a customer.</p>
      </div>

      <div className="card">
        <InvoiceForm customers={safeCustomers} transporters={safeTransporters} />
      </div>
    </div>
  );
}
