import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Customer from "@/models/Customer";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const customer = await Customer.findById(resolvedParams.id).lean();
    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ customer }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    await dbConnect();

    // Do not allow overriding storeId or security fields
    delete data.storeId;
    delete data._id;
    
    const updatedCustomer = await Customer.findByIdAndUpdate(resolvedParams.id, data, { new: true });
    if (!updatedCustomer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, customer: updatedCustomer }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
