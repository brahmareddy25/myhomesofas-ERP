import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Expense from "@/models/Expense";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    const storeId = (session.user as any).storeId;
    const query = role === "Store" ? { storeId } : {};

    await dbConnect();
    const expenses = await Expense.find(query).populate('storeId', 'storeName').sort({ createdAt: -1 });
    return NextResponse.json(expenses, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    const storeId = (session.user as any).storeId;
    const userId = (session.user as any).id;

    const body = await req.json();
    await dbConnect();
    
    const payloadStoreId = role === "Store" ? storeId : body.storeId;
    if (!payloadStoreId) {
      return NextResponse.json({ error: "No store context for user. Please select a store." }, { status: 400 });
    }

    // Auto assign storeId and submittedBy if store role
    const payload = {
      ...body,
      storeId: payloadStoreId,
      submittedBy: userId,
      status: 'Pending Approval'
    };

    const newExpense = await Expense.create(payload);
    return NextResponse.json(newExpense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
