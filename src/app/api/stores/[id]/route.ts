import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const store = await Store.findById((await params).id).lean();
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const user = await User.findOne({ storeId: store._id, role: 'Store' }).lean();

    return NextResponse.json({ ...store, username: user?.username || "" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    const storeId = (await params).id;

    // 1. Update the Store
    const updatedStore = await Store.findByIdAndUpdate(storeId, {
      storeName: body.storeName,
      managerName: body.managerName,
      contactNumber: body.contactNumber,
      gstNumber: body.gstNumber,
      address: body.address,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      isActive: body.isActive
    }, { new: true });

    if (!updatedStore) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    // 2. Update the User
    if (body.username) {
      const existingUser = await User.findOne({ storeId: storeId, role: 'Store' });
      
      if (existingUser) {
        existingUser.username = body.username;
        existingUser.isActive = body.isActive;
        if (body.password) {
          existingUser.password = await bcrypt.hash(body.password, 10);
        }
        await existingUser.save();
      } else if (body.password) {
        // Create user if it didn't exist
        const hashedPassword = await bcrypt.hash(body.password, 10);
        await User.create({
          username: body.username,
          password: hashedPassword,
          role: 'Store',
          storeId: storeId,
          isActive: body.isActive
        });
      }
    }

    return NextResponse.json(updatedStore, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const storeId = (await params).id;
    await Store.findByIdAndDelete(storeId);
    await User.findOneAndDelete({ storeId: storeId });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
