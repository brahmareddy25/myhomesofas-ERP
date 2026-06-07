import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    // Fetch invoices for this customer to see which orders are already invoiced
    const invoices = await mongoose.models.Invoice.find({ customerId: id }).select('orders').lean();
    const invoicedOrderIds = new Set(invoices.map((inv: any) => inv.orders).flat().map((oId: any) => oId.toString()));

    // Fetch all orders for this customer, deeply populating Quotation and Measurement
    // so we have access to the suggestedSellingPrice and productType
    let orders = await Order.find({ customerId: id })
      .populate({
        path: 'quotationId',
        model: mongoose.models.Quotation || require('@/models/Quotation').default,
        populate: {
          path: 'measurementId',
          model: mongoose.models.Measurement || require('@/models/Measurement').default
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out orders that are already invoiced
    orders = orders.filter(o => !invoicedOrderIds.has(o._id.toString()));

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error: any) {
    console.error("Customer Orders GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
