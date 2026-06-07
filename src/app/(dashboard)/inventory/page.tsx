"use client";

import { useEffect, useState } from "react";
import { PackageOpen, AlertTriangle, Plus, Search, Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/inventory")
      .then(res => res.json())
      .then(data => {
        if (data.inventory) {
          setInventory(data.inventory);
        }
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inventory item?")) return;
    
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setInventory(prev => prev.filter(item => item._id !== id));
      } else {
        toast.error("Failed to delete item.");
      }
    } catch (e) {
      toast.error("Error deleting item.");
    }
  };

  const totalAssets = inventory.length;
  const criticalStock = inventory.filter(item => item.quantityInStock <= item.reorderLevel).length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.6s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '1px' }}>Resource <span className="text-gold" style={{ fontWeight: 600 }}>Inventory</span></h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Monitor raw materials and automatic stock alerts.</p>
        </div>
        <button onClick={() => router.push("/inventory/new")} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={18} /> Requisition Stock
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1.25rem', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-gold-primary)', borderRadius: 'var(--radius-lg)', boxShadow: 'inset 0 0 0 1px rgba(212, 175, 55, 0.3)' }}>
            <PackageOpen size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>Total Assets</p>
            <h4 style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--color-text-primary)' }}>{totalAssets}</h4>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1.25rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-lg)', boxShadow: 'inset 0 0 0 1px rgba(239, 68, 68, 0.3)' }}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>Critical Stock</p>
            <h4 style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--color-error)' }}>{criticalStock}</h4>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1.5rem', background: 'var(--color-bg-elevated)' }}>
          <div className="premium-input-group" style={{ flex: 1, margin: 0 }}>
            <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gold-primary)' }} />
            <input type="text" placeholder="Search catalog..." className="premium-input" style={{ paddingLeft: '3rem' }} />
          </div>
          <div className="premium-input-group" style={{ width: '250px', margin: 0 }}>
            <select className="premium-input">
              <option>All Categories</option>
              <option>Raw Material</option>
              <option>Parts</option>
            </select>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Asset Name</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Category</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>In Stock</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => {
              const isCritical = item.quantityInStock <= item.reorderLevel;
              return (
              <tr key={item._id} style={{ 
                borderBottom: '1px solid var(--color-border)', 
                backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                transition: 'background var(--transition-fast)' 
              }} onMouseOver={e => e.currentTarget.style.background = isCritical ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = isCritical ? 'rgba(239, 68, 68, 0.05)' : 'transparent'}>
                <td style={{ padding: '1.5rem', fontWeight: 500, color: isCritical ? 'var(--color-error)' : 'var(--color-text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isCritical && <AlertTriangle size={16} />}
                    {item.itemName}
                  </div>
                </td>
                <td style={{ padding: '1.5rem', color: 'var(--color-text-secondary)' }}>{item.category}</td>
                <td style={{ padding: '1.5rem' }}>
                  <span style={{ 
                    fontWeight: 600,
                    color: isCritical ? 'var(--color-error)' : 'var(--color-gold-primary)',
                    fontSize: '1.1rem'
                  }}>
                    {item.quantityInStock} <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>{item.unitOfMeasurement}</span>
                  </span>
                </td>
                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button onClick={() => router.push(`/inventory/${item._id}/edit`)} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }} title="Edit/Audit Stock">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--color-error)', borderColor: 'rgba(239, 68, 68, 0.3)' }} title="Delete Item">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )})}
            {inventory.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  No items in inventory. Click "Requisition Stock" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
