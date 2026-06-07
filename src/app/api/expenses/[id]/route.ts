import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Expense from "@/models/Expense";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized Admin Only" }, { status: 401 });
    }

    const body = await req.json(); // expected { status: 'Approved' | 'Rejected' }
    await dbConnect();

    const updatedExpense = await Expense.findByIdAndUpdate((await params).id, {
      status: body.status,
      approvedBy: (session.user as any).id
    }, { new: true });
    
    if (!updatedExpense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

    return NextResponse.json(updatedExpense, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
