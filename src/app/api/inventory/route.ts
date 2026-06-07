import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    
    const role = (session.user as any).role;
    let storeId = (session.user as any).storeId;
    
    // We will parse JSON body lazily to get storeId if Admin
    let bodyData: any = {};
    try {
      // Clone the request so we can read json multiple times
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

    const newInventory = new Inventory({
      ...data,
      storeId: storeId
    });

    await newInventory.save();

    const totalCost = newInventory.quantityInStock * newInventory.unitCost;
    if (totalCost > 0) {
      // Create an automatic expense entry
      const Expense = mongoose.models.Expense || require('@/models/Expense').default;
      const newExpense = new Expense({
        storeId: storeId,
        submittedBy: (session.user as any).id || (session.user as any)._id,
        category: 'Material',
        description: `Auto-generated: Purchased ${newInventory.quantityInStock} ${newInventory.unitOfMeasurement} of ${newInventory.itemName} from ${newInventory.supplierName || 'Supplier'}`,
        amount: totalCost,
        dateIncurred: new Date(),
        status: 'Paid',
      });
      await newExpense.save();
    }

    return NextResponse.json({ success: true, inventory: newInventory }, { status: 201 });
  } catch (error: any) {
    console.error("Inventory POST error:", error);
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
    const inventoryItems = await Inventory.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ inventory: inventoryItems }, { status: 200 });
  } catch (error: any) {
    console.error("Inventory GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
