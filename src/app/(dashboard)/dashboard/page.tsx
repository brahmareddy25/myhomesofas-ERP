"use client";

import { useSession } from "next-auth/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, TrendingUp, ShoppingBag, Users, Activity, X, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import toast from 'react-hot-toast';

function DashboardContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");
  
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState("sales");
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const url = storeId ? `/api/dashboard?storeId=${storeId}` : "/api/dashboard";
    fetch(url)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, [storeId]);

  const role = stats?.role || "Store";
  const isAdmin = role === "Admin";

  // Premium Dummy Data for Demo (used if DB is empty)
  const categoryData = [
    { name: 'Straight Sofas', sales: 400 },
    { name: 'L-Shape Sofas', sales: 650 },
    { name: 'Recliners', sales: 300 },
    { name: 'Beds', sales: 450 },
  ];

  return (
    <div id="dashboard-content" className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.8s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 300, letterSpacing: '1px' }}>
            Executive <span className="text-gold" style={{ fontWeight: 600 }}>Analytics</span>
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', marginTop: '0.25rem' }}>
            Welcome back, {session?.user?.name || 'Administrator'}. Here is your enterprise overview.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select className="premium-input" style={{ width: 'auto', padding: '0.5rem 2.5rem 0.5rem 1rem' }} defaultValue="This Quarter">
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
          <button className="btn btn-primary" style={{ gap: '0.5rem' }} onClick={() => setReportModalOpen(true)}>
            <Activity size={18} /> Generate Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          ...(isAdmin ? [
            { title: "Total Revenue", value: `$${stats?.totalRevenue?.toLocaleString() || 0}`, trend: "+0%", icon: DollarSign },
            { title: "Net Profit Margin", value: `${stats?.netProfitMargin?.toFixed(1) || 0}%`, trend: "+0%", icon: TrendingUp }
          ] : []),
          { title: "Active Inquiries", value: `${stats?.activeOrders || 0}`, trend: "+0%", icon: ShoppingBag },
          { title: "Total Customers", value: `${stats?.customersCount || 0}`, trend: "+0%", icon: Users }
        ].map((kpi, index) => (
          <div key={index} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <kpi.icon size={20} className="text-gold" />
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                {kpi.trend}
              </span>
            </div>
            <div>
              <h4 style={{ fontSize: '2rem', fontWeight: 300 }}>{kpi.value}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '0.25rem' }}>{kpi.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6 mt-4`}>
        
        {/* Main Revenue Chart - ONLY FOR ADMIN */}
        {isAdmin && (
          <div className="card lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', height: '450px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '1px' }}>Revenue vs Expenses</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Fiscal year to date performance.</p>
            </div>
            <div style={{ flex: 1, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.revenueData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-gold-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-gold-primary)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--color-text-secondary)" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--color-text-secondary)" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}
                    itemStyle={{ color: 'var(--color-text-primary)' }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '0.875rem' }}/>
                  <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="var(--color-gold-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="expenses" name="Operating Expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category Sales Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '450px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '1px' }}>Sales by Category</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Product volume distribution.</p>
          </div>
          <div style={{ flex: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categoryData || categoryData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="var(--color-text-secondary)" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--color-text-secondary)" tick={{ fill: 'var(--color-text-primary)', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}
                />
                <Bar dataKey="sales" name="Units Sold" fill="var(--color-gold-primary)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Report Generator Modal */}
      {isReportModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '500px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '1px' }}>Generate <span className="text-gold" style={{ fontWeight: 600 }}>Report</span></h3>
              <button onClick={() => setReportModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <div className="premium-input-group">
              <select className="premium-input" value={reportType} onChange={e => setReportType(e.target.value)}>
                <option value="" disabled hidden></option>
                <option value="sales">Sales & Revenue Report (AI)</option>
                <option value="store">Store Performance Report (AI)</option>
                <option value="product">General Business Health (AI)</option>
              </select>
              <label className="premium-label">Select Report Type</label>
            </div>

            <div className="premium-input-group">
              <select className="premium-input" defaultValue="">
                <option value="" disabled hidden></option>
                <option value="pdf">PDF Document</option>
                <option value="excel">Excel Spreadsheet</option>
              </select>
              <label className="premium-label">Export Format</label>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', gap: '0.5rem', marginTop: '1rem' }}
              disabled={isGenerating}
              onClick={async () => {
                setIsGenerating(true);
                try {
                  const res = await fetch("/api/ai/report", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reportType })
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error);

                  const { jsPDF } = await import('jspdf');
                  const doc = new jsPDF();
                  
                  doc.setFontSize(18);
                  doc.setTextColor(212, 175, 55); // Gold
                  doc.text("Executive AI Analysis Report", 20, 20);
                  
                  doc.setFontSize(10);
                  doc.setTextColor(50, 50, 50);
                  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 28);
                  
                  doc.setDrawColor(200, 200, 200);
                  doc.line(20, 32, 190, 32);

                  doc.setFontSize(11);
                  doc.setTextColor(0, 0, 0);
                  // Split markdown text to fit A4 width
                  const lines = doc.splitTextToSize(data.report, 170);
                  
                  // Handle pagination if text exceeds 1 page
                  let yPos = 40;
                  for (let i = 0; i < lines.length; i++) {
                    if (yPos > 280) {
                      doc.addPage();
                      yPos = 20;
                    }
                    doc.text(lines[i], 20, yPos);
                    yPos += 6;
                  }
                  
                  doc.save('AI_Executive_Report.pdf');
                  setReportModalOpen(false);
                } catch (error) {
                  console.error("Report generation failed", error);
                  toast.error("Failed to generate AI Report. Check console.");
                } finally {
                  setIsGenerating(false);
                }
              }}
            >
              <FileText size={18} /> {isGenerating ? "Analyzing Database..." : "Export Document"}
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
