import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const stores = await Store.find({}).sort({ createdAt: -1 }).lean();
    
    // Attach username for each store
    const storeIds = stores.map(s => s._id);
    const users = await User.find({ storeId: { $in: storeIds }, role: 'Store' }).lean();
    
    const enrichedStores = stores.map((s: any) => {
      const user = users.find((u: any) => u.storeId?.toString() === s._id.toString());
      return { ...s, username: user ? user.username : "" };
    });

    return NextResponse.json(enrichedStores, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();
    
    // 1. Check if username exists
    if (body.username) {
      const existingUser = await User.findOne({ username: body.username });
      if (existingUser) {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 });
      }
    }

    // 2. Create the Store
    const newStore = await Store.create({
      storeName: body.storeName,
      managerName: body.managerName,
      contactNumber: body.contactNumber,
      gstNumber: body.gstNumber,
      address: body.address,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      isActive: body.isActive
    });

    // 3. Create the User for the store
    if (body.username && body.password) {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      await User.create({
        username: body.username,
        password: hashedPassword,
        role: 'Store',
        storeId: newStore._id,
        isActive: body.isActive
      });
    }

    return NextResponse.json(newStore, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
