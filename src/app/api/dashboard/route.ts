import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Invoice from "@/models/Invoice";
import Order from "@/models/Order";
import Measurement from "@/models/Measurement";
import Expense from "@/models/Expense";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const storeId = (session.user as any).storeId;

    await dbConnect();

    const url = req.nextUrl;
    const filterStoreId = url.searchParams.get("storeId");

    const query = role === "Store" ? { storeId: storeId } : (filterStoreId ? { storeId: filterStoreId } : {});

    // 1. Total Revenue and Expenses
    const invoices = await Invoice.find(query).lean();
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    const expensesList = await Expense.find(query).lean();
    const totalExpenses = expensesList.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    const netProfitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;

    // Build dynamic Revenue vs Expenses chart data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyStats: Record<string, { revenue: number, expenses: number }> = {};
    monthNames.forEach(m => monthlyStats[m] = { revenue: 0, expenses: 0 });

    invoices.forEach(inv => {
      const date = new Date(inv.createdAt);
      if (date.getFullYear() === currentYear) {
        const month = monthNames[date.getMonth()];
        monthlyStats[month].revenue += (inv.totalAmount || 0);
      }
    });

    expensesList.forEach(exp => {
      const date = new Date(exp.dateIncurred || exp.createdAt);
      if (date.getFullYear() === currentYear) {
        const month = monthNames[date.getMonth()];
        monthlyStats[month].expenses += (exp.amount || 0);
      }
    });

    const revenueData = monthNames.map(month => ({
      month,
      revenue: monthlyStats[month].revenue,
      expenses: monthlyStats[month].expenses
    }));

    // 2. Active Orders / Measurements
    // For now, let's just count total measurements or quotes as orders
    const activeOrders = await Measurement.countDocuments(query);

    // 3. New Customers
    const customersCount = await Customer.countDocuments(query);

    // 4. Category Data (group measurements by productType)
    const measurements = await Measurement.find(query).select('productType').lean();
    const categoryCounts: Record<string, number> = {};
    measurements.forEach(m => {
      const pt = m.productType || "Sofa";
      categoryCounts[pt] = (categoryCounts[pt] || 0) + 1;
    });
    const categoryData = Object.keys(categoryCounts).map(k => ({
      name: k,
      sales: categoryCounts[k]
    }));

    // If no category data, provide some defaults so the chart isn't empty
    if (categoryData.length === 0) {
      categoryData.push(
        { name: 'Straight Sofas', sales: 0 },
        { name: 'L-Shape Sofas', sales: 0 },
        { name: 'Recliners', sales: 0 },
        { name: 'Beds', sales: 0 }
      );
    }

    return NextResponse.json({
      role,
      totalRevenue,
      netProfitMargin,
      activeOrders,
      customersCount,
      categoryData,
      revenueData
    }, { status: 200 });

  } catch (error: any) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
