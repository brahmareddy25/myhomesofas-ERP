import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import User from "@/models/User"; // Ensure User model is loaded for populate

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const logs = await AuditLog.find()
      .populate('userId', 'username role')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error: any) {
    console.error("AuditLogs GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
