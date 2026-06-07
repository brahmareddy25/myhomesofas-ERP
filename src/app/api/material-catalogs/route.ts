import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import MaterialCatalog from "@/models/MaterialCatalog";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const newCatalog = new MaterialCatalog({
      ...data,
      storeId: storeId
    });

    await newCatalog.save();

    return NextResponse.json({ success: true, catalog: newCatalog }, { status: 201 });
  } catch (error: any) {
    console.error("MaterialCatalog POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    const storeId = (session.user as any).storeId;

    await dbConnect();

    const query = role === "Store" ? { storeId: storeId } : {};
    const catalogs = await MaterialCatalog.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ catalogs }, { status: 200 });
  } catch (error: any) {
    console.error("MaterialCatalog GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
