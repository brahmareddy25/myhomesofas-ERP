"use client";

import { useState, useEffect } from "react";
import { Save, Shield, Settings2, FileText, Database } from "lucide-react";
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    defaultTerms: "Terms: 50% advance required. Balance before dispatch. Warranty covers manufacturing defects for 1 year."
  });
  const [isSavingTax, setIsSavingTax] = useState(false);
  const [isSavingTerms, setIsSavingTerms] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSettings(data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleSaveSettings = async (type: 'tax' | 'terms') => {
    if (type === 'tax') setIsSavingTax(true);
    else setIsSavingTerms(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(type === 'tax' ? "Tax configuration updated!" : "Document terms updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      if (type === 'tax') setIsSavingTax(false);
      else setIsSavingTerms(false);
    }
  };
  const auditLogs = [
    { id: "AUD-8921", user: "Admin", action: "Updated Global CGST Rate to 9%", date: "2023-11-03 14:22" },
    { id: "AUD-8920", user: "Downtown Mgr", action: "Approved Expense EXP-102", date: "2023-11-03 10:15" },
    { id: "AUD-8919", user: "Admin", action: "Added new Transporter TRN-003", date: "2023-11-02 18:45" },
    { id: "AUD-8918", user: "Westside Mgr", action: "Generated Quotation QT-2023-003", date: "2023-11-02 11:30" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.6s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '1px' }}>System <span className="text-gold" style={{ fontWeight: 600 }}>Configuration</span></h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Manage master settings, taxes, and view audit trails.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        
        {/* Left Column: Global Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              <Settings2 size={20} className="text-gold" /> Tax & Finance Config
            </h4>
            
            <div className="premium-input-group">
              <input 
                type="number" 
                value={settings.cgstRate} 
                onChange={e => setSettings({...settings, cgstRate: Number(e.target.value)})}
                className="premium-input" 
              />
              <label className="premium-label">Global CGST Rate (%)</label>
            </div>
            
            <div className="premium-input-group">
              <input 
                type="number" 
                value={settings.sgstRate} 
                onChange={e => setSettings({...settings, sgstRate: Number(e.target.value)})}
                className="premium-input" 
              />
              <label className="premium-label">Global SGST Rate (%)</label>
            </div>

            <div className="premium-input-group">
              <input 
                type="number" 
                value={settings.igstRate} 
                onChange={e => setSettings({...settings, igstRate: Number(e.target.value)})}
                className="premium-input" 
              />
              <label className="premium-label">Global IGST Rate (%)</label>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', gap: '0.5rem' }}
              onClick={() => handleSaveSettings('tax')}
              disabled={isSavingTax}
            >
              <Save size={18} /> {isSavingTax ? "Updating..." : "Update Tax Configuration"}
            </button>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              <FileText size={20} className="text-gold" /> Document Settings
            </h4>
            
            <div className="premium-input-group">
              <textarea 
                className="premium-input" 
                rows={3} 
                value={settings.defaultTerms}
                onChange={e => setSettings({...settings, defaultTerms: e.target.value})}
              />
              <label className="premium-label">Default Quotation T&C</label>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', gap: '0.5rem' }}
              onClick={() => handleSaveSettings('terms')}
              disabled={isSavingTerms}
            >
              <Save size={18} /> {isSavingTerms ? "Updating..." : "Update Terms"}
            </button>
          </div>
        </div>

        {/* Right Column: Audit Logs */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              <Shield size={20} className="text-gold" /> System Audit Logs
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Immutable record of all administrative actions.</p>
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Timestamp</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>User</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Action Taken</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background var(--transition-fast)' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Database size={14} /> {log.date}
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem', fontWeight: 600, color: log.user === 'Admin' ? 'var(--color-gold-primary)' : 'var(--color-text-primary)' }}>{log.user}</td>
                    <td style={{ padding: '1.5rem', color: 'var(--color-text-primary)', fontSize: '0.875rem' }}>{log.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
