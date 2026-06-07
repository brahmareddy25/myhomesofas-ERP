import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Measurement from "@/models/Measurement";

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

    const newMeasurement = new Measurement({
      ...data,
      storeId: storeId
    });

    await newMeasurement.save();

    return NextResponse.json({ success: true, measurement: newMeasurement }, { status: 201 });
  } catch (error: any) {
    console.error("Measurement POST error:", error);
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

    const query = role === "Store" ? { storeId: storeId } : {};
    const measurements = await Measurement.find(query).sort({ createdAt: -1 }).populate('customerId').lean();

    return NextResponse.json({ measurements }, { status: 200 });
  } catch (error: any) {
    console.error("Measurement GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
