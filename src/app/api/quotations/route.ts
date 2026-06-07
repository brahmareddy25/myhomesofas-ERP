import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Quotation from "@/models/Quotation";
import Customer from "@/models/Customer";
import Measurement from "@/models/Measurement";
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
    
    // We will parse JSON body lazily to get storeId if Admin
    let bodyData: any = {};
    try {
      // Clone the request so we can read json multiple times
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

    // Generate unique Quotation Number QT-YYYY-XXXX
    const count = await Quotation.countDocuments();
    const year = new Date().getFullYear();
    const quotationNumber = `QT-${year}-${String(count + 1).padStart(3, '0')}`;

    const newQuotation = new Quotation({
      ...data,
      storeId: storeId,
      quotationNumber: quotationNumber,
      status: 'Draft',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    await newQuotation.save();

    return NextResponse.json({ success: true, quotation: newQuotation }, { status: 201 });
  } catch (error: any) {
    console.error("Quotation POST error:", error);
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const q = searchParams.get('q') || '';
    
    const query: any = role === "Store" ? { storeId: storeId } : {};

    if (q) {
      const matchingCustomers = await Customer.find({
        $or: [
          { customerName: { $regex: q, $options: 'i' } },
          { mobileNumber: { $regex: q, $options: 'i' } }
        ]
      }).select('_id').lean();
      
      const customerIds = matchingCustomers.map(c => c._id);
      query.$or = [
        { quotationNumber: { $regex: q, $options: 'i' } },
        { customerId: { $in: customerIds } }
      ];
    }

    const totalItems = await Quotation.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const quotations = await Quotation.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'customerId', model: Customer })
      .populate({ path: 'measurementId', model: Measurement })
      .populate({ path: 'storeId', model: mongoose.models.Store || require('@/models/Store').default })
      .lean();

    return NextResponse.json({ quotations, page, totalPages, totalItems }, { status: 200 });
  } catch (error: any) {
    console.error("Quotation GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
