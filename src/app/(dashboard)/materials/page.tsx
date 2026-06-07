"use client";

import { useEffect, useState } from "react";
import { Palette, Plus, Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';

export default function MaterialsPage() {
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/material-catalogs")
      .then(res => res.json())
      .then(data => {
        if (data.catalogs) {
          setCatalogs(data.catalogs);
        }
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material catalog?")) return;
    
    try {
      const res = await fetch(`/api/material-catalogs/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setCatalogs(prev => prev.filter(c => c._id !== id));
      } else {
        toast.error("Failed to delete catalog.");
      }
    } catch (e) {
      toast.error("Error deleting catalog.");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.6s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '1px' }}>Material <span className="text-gold" style={{ fontWeight: 600 }}>Catalogs</span></h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Manage fabrics, colors, and material options.</p>
        </div>
        <button onClick={() => router.push("/materials/new")} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={18} /> New Catalog
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Catalog Name</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Colors Count</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {catalogs.map((catalog) => (
              <tr key={catalog._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1.5rem', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Palette size={16} className="text-gold" /> {catalog.name}
                  </div>
                </td>
                <td style={{ padding: '1.5rem', color: 'var(--color-text-secondary)' }}>
                  {catalog.colors?.length || 0} Colors
                </td>
                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button onClick={() => router.push(`/materials/${catalog._id}/edit`)} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }} title="Edit Catalog">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(catalog._id)} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--color-error)', borderColor: 'rgba(239, 68, 68, 0.3)' }} title="Delete Catalog">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {catalogs.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  No material catalogs found. Click "New Catalog" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
