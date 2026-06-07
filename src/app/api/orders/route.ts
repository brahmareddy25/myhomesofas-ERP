import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

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

    if (!data.orderNumber) {
      const count = await Order.countDocuments();
      const year = new Date().getFullYear();
      data.orderNumber = `ORD-${year}-${String(count + 1).padStart(3, '0')}`;
    }

    const newOrder = new Order({
      ...data,
      storeId: storeId
    });

    await newOrder.save();

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error("Order POST error:", error);
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
    const q = searchParams.get('q') || '';

    const query: any = role === "Store" ? { storeId: storeId } : {};

    if (q) {
      const matchingCustomers = await require('@/models/Customer').default.find({
        $or: [
          { customerName: { $regex: q, $options: 'i' } },
          { mobileNumber: { $regex: q, $options: 'i' } }
        ]
      }).select('_id').lean();
      
      const customerIds = matchingCustomers.map((c: any) => c._id);
      query.$or = [
        { orderNumber: { $regex: q, $options: 'i' } },
        { customerId: { $in: customerIds } }
      ];
    } else {
      query.status = { $nin: ['Completed', 'Delivered'] };
    }

    const orders = await Order.find(query)
      .populate('customerId', 'name customerName email phone')
      .populate('quotationId', 'quotationNumber')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    console.error("Order GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
