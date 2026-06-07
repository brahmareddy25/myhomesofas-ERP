import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Payslip from "@/models/Payslip";
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

    const newPayslip = new Payslip({
      ...data,
      storeId: storeId
    });

    await newPayslip.save();

    if (newPayslip.netPay > 0) {
      // Create an automatic expense entry
      const Expense = mongoose.models.Expense || require('@/models/Expense').default;
      const newExpense = new Expense({
        storeId: storeId,
        submittedBy: (session.user as any).id || (session.user as any)._id,
        category: 'Salary',
        description: `Auto-generated: Salary Disbursement for ${newPayslip.month} ${newPayslip.year} (Employee ID: ${newPayslip.employeeId})`,
        amount: newPayslip.netPay,
        dateIncurred: new Date(),
        status: 'Paid',
      });
      await newExpense.save();
    }

    return NextResponse.json({ success: true, payslip: newPayslip }, { status: 201 });
  } catch (error: any) {
    console.error("Payslip POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
