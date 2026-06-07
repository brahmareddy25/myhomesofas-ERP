import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import Store from "@/models/Store";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    let storeId = (session.user as any).storeId;

    let bodyData: any = {};
    try {
      const reqClone = req.clone();
      bodyData = await reqClone.json();
    } catch (e) {}

    if (role === "Admin" && bodyData.storeId) {
      storeId = bodyData.storeId;
    }

    if (!storeId) {
      return NextResponse.json({ error: "No store context for user. Please select a store." }, { status: 400 });
    }

    const data = await req.json();

    await dbConnect();

    const count = await Invoice.countDocuments();
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(3, '0')}`;

    const newInvoice = new Invoice({
      ...data,
      storeId: storeId,
      invoiceNumber: invoiceNumber,
    });

    await newInvoice.save();

    return NextResponse.json({ success: true, invoice: newInvoice }, { status: 201 });
  } catch (error: any) {
    console.error("Invoice POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const storeId = (session.user as any).storeId;

    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const latest = searchParams.get('latest') === 'true';

    const query: any = role === "Store" ? { storeId: storeId } : {};

    if (search) {
      const matchingCustomers = await Customer.find({
        $or: [
          { customerName: { $regex: search, $options: 'i' } },
          { mobileNumber: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const customerIds = matchingCustomers.map(c => c._id);

      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerId: { $in: customerIds } }
      ];
    } else if (!latest) {
      // If no search and not latest, hide fully paid invoices by default to keep list clean
      query.paymentStatus = { $ne: 'Paid' };
    }

    let invoicesQuery = Invoice.find(query).sort({ createdAt: -1 });
    if (latest) {
      invoicesQuery = invoicesQuery.limit(3);
    }

    const invoices = await invoicesQuery
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

    return NextResponse.json({ invoices }, { status: 200 });
  } catch (error: any) {
    console.error("Invoice GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
