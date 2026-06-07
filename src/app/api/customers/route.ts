import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Customer from "@/models/Customer";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    let storeId = (session.user as any).storeId;
    const data = await req.json();

    if (role === "Admin" && data.storeId) {
      storeId = data.storeId;
    }

    if (!storeId) {
      return NextResponse.json({ error: "No store context for user. Please select a store." }, { status: 400 });
    }

    await dbConnect();

    const newCustomer = new Customer({
      ...data,
      storeId: storeId
    });

    await newCustomer.save();

    return NextResponse.json({ success: true, customer: newCustomer }, { status: 201 });
  } catch (error: any) {
    console.error("Customer POST error:", error);
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
    const customers = await Customer.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ customers }, { status: 200 });
  } catch (error: any) {
    console.error("Customer GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
