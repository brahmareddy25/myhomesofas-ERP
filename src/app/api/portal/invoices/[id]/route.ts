import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Invoice ID" }, { status: 400 });
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
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ invoice }, { status: 200 });
  } catch (error: any) {
    console.error("Portal Invoice GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
