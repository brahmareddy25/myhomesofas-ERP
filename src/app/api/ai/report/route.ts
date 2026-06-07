import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Invoice from "@/models/Invoice";
import Quotation from "@/models/Quotation";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportType } = await req.json();
    const role = (session.user as any).role;
    const storeId = (session.user as any).storeId;

    await dbConnect();

    // Gather real DB statistics for the prompt
    const query = role === "Store" ? { storeId: storeId } : {};
    
    const customersCount = await Customer.countDocuments(query);
    const invoices = await Invoice.find(query).lean();
    const quotations = await Quotation.find(query).lean();

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const totalBalanceDue = invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
    const pendingQuotes = quotations.filter(q => q.status === "Draft" || q.status === "Sent").length;
    const approvedQuotes = quotations.filter(q => q.status === "Approved").length;

    // Build the AI Prompt based on reportType
    let prompt = `You are an elite Business Analyst AI for "My Home Sofas" (a premium customized furniture manufacturer).
Write a professional, detailed, and beautifully formatted Markdown Executive Report based on the following real-time data:
- Total Customers: ${customersCount}
- Total Revenue Collected: ₹${totalRevenue.toLocaleString()}
- Total Balance/Receivables Due: ₹${totalBalanceDue.toLocaleString()}
- Approved Quotations: ${approvedQuotes}
- Pending Quotations: ${pendingQuotes}

`;

    if (reportType === 'sales') {
      prompt += "Focus this report on Sales & Revenue performance. Analyze the cash flow, receivables, and conversion rates of quotations to approved sales. Provide 3 actionable recommendations to improve revenue collection.";
    } else if (reportType === 'store') {
      prompt += "Focus this report on overall Store Performance & Health. Discuss customer acquisition, pipeline health (quotations), and operational efficiency. Provide a brief SWOT analysis.";
    } else {
      prompt += "Provide a general Business Health & Financial Executive Summary. Include sections on Revenue, Customer Base, Quotation Pipeline, and Strategic Recommendations.";
    }

    prompt += "\nFormat the response strictly in Markdown using proper headings (#, ##), bullet points, and bold text for emphasis. Do not include any greeting or conversational filler; output only the final report document.";

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 2000,
    });

    const reportMarkdown = completion.choices[0]?.message?.content || "Failed to generate report.";

    return NextResponse.json({ success: true, report: reportMarkdown }, { status: 200 });
  } catch (error: any) {
    console.error("AI Report Generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
