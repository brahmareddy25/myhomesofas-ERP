import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Measurement from "@/models/Measurement";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

export default async function MeasurementDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  await dbConnect();

  const measurement = await Measurement.findById(id).populate('customerId').populate('storeId').lean();
  if (!measurement) {
    return (
      <div className="p-6 text-center">
        <h2>Measurement not found</h2>
        <Link href="/measurements" className="btn btn-primary mt-4">Back to Directory</Link>
      </div>
    );
  }

  const m: any = measurement;
  const cust: any = m.customerId;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/measurements" className="btn btn-outline" style={{ padding: '0.5rem' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Measurement Details</h3>
            <p className="text-secondary">Configuration for {cust?.customerName || 'Unknown Customer'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/quotations/new?measurementId=${m._id}`} className="btn btn-primary">
            Generate Quotation
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h4 className="text-lg font-semibold mb-4 text-gold">Product Information</h4>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-secondary text-sm">Product Type</p>
              <p className="font-medium">{m.productType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-secondary text-sm">Dimensions (L x W x H)</p>
              <p className="font-medium">{m.length || 0} x {m.width || 0} x {m.height || 0} {m.unit || 'cm'}</p>
            </div>
            <div>
              <p className="text-secondary text-sm">Seat (W x D x H)</p>
              <p className="font-medium">{m.seatWidth || 0} x {m.seatDepth || 0} x {m.seatHeight || 0} {m.unit || 'cm'}</p>
            </div>
            <div>
              <p className="text-secondary text-sm">Backrest Height</p>
              <p className="font-medium">{m.backrestHeight || 0} {m.unit || 'cm'}</p>
            </div>
            <div>
              <p className="text-secondary text-sm">Color / Fabric</p>
              <p className="font-medium">{m.colorCode || 'N/A'}</p>
            </div>
            <div>
              <p className="text-secondary text-sm">Cushion Type</p>
              <p className="font-medium">{m.cushionType || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 className="text-lg font-semibold mb-4 text-gold">Customer Details</h4>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-secondary text-sm">Name</p>
              <p className="font-medium">{cust?.customerName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-secondary text-sm">Mobile</p>
              <p className="font-medium">{cust?.mobileNumber || 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-secondary text-sm">Address</p>
              <p className="font-medium">{cust?.fullAddress || 'N/A'}, {cust?.city || ''}</p>
            </div>
          </div>
        </div>

        <div className="card col-span-1 md:col-span-2">
          <h4 className="text-lg font-semibold mb-4 text-gold">Special Notes</h4>
          <p className="whitespace-pre-wrap">{m.specialNotes || 'No special notes provided.'}</p>
        </div>
      </div>
    </div>
  );
}
