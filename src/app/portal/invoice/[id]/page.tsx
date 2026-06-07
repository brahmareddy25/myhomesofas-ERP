import dbConnect from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import mongoose from "mongoose";
import PortalClient from "./PortalClient";

export default async function CustomerPortalInvoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return <ErrorPage msg="Invalid Invoice ID" />;
  }

  await dbConnect();

  const invoice = await Invoice.findById(id)
    .populate({ path: 'customerId', model: Customer })
    .populate({ 
      path: 'orders', 
      model: Order,
      populate: {
        path: 'quotationId',
        model: mongoose.models.Quotation || require('@/models/Quotation').default,
        populate: {
          path: 'measurementId',
          model: mongoose.models.Measurement || require('@/models/Measurement').default
        }
      }
    })
    .populate({ path: 'storeId', model: mongoose.models.Store || require('@/models/Store').default })
    .lean();

  if (!invoice) {
    return <ErrorPage msg="Invoice not found." />;
  }

  // Pass plain object to client
  const plainInvoice = JSON.parse(JSON.stringify(invoice));

  return <PortalClient invoice={plainInvoice} />;
}

function ErrorPage({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] p-6 text-center">
      <h1 className="text-2xl font-bold text-white mb-2">Invoice Error</h1>
      <p className="text-gray-400">{msg}</p>
    </div>
  );
}
