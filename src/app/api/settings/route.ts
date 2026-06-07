import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Settings from "@/models/Settings";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    let settings = await Settings.findOne({ key: "global" }).lean();
    
    // If no settings exist yet, create default
    if (!settings) {
      settings = await Settings.create({ key: "global" });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    await dbConnect();

    const updatedSettings = await Settings.findOneAndUpdate(
      { key: "global" },
      { $set: data },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, settings: updatedSettings }, { status: 200 });
  } catch (error: any) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
