"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Palette, Plus, Trash2 } from "lucide-react";
import StoreSelector from "@/components/ui/StoreSelector";
import toast from 'react-hot-toast';

export default function MaterialForm({ initialData, catalogId }: { initialData?: any, catalogId?: string }) {
  const router = useRouter();
  const [storeId, setStoreId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState(initialData?.name || "");
  const [colors, setColors] = useState<{ name: string, code: string }[]>(initialData?.colors || [{ name: "", code: "" }]);

  const handleAddColor = () => {
    setColors([...colors, { name: "", code: "" }]);
  };

  const handleRemoveColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const handleColorChange = (index: number, field: 'name' | 'code', value: string) => {
    const newColors = [...colors];
    newColors[index][field] = value;
    setColors(newColors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out completely empty colors
    const validColors = colors.filter(c => c.name.trim() || c.code.trim());
    
    if (validColors.length === 0) {
      return toast.error("Please add at least one color.");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        colors: validColors,
        storeId: storeId || undefined
      };

      const url = catalogId ? `/api/material-catalogs/${catalogId}` : "/api/material-catalogs";
      const method = catalogId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        router.push("/materials");
        router.refresh();
      } else {
        const error = await res.json();
        toast.error("Error saving catalog: " + error.error);
      }
    } catch (err) {
      toast.error("Failed to connect to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {!initialData && <StoreSelector value={storeId} onChange={setStoreId} />}
      
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <Palette size={20} className="text-gold" /> Catalog Details
        </h4>
        
        <div className="premium-input-group">
          <input type="text" className="premium-input" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Premium Velvet Collection" />
          <label className="premium-label">Catalog Name *</label>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            <Palette size={20} className="text-gold" /> Color Swatches
          </h4>
          <button type="button" onClick={handleAddColor} className="btn btn-outline" style={{ padding: '0.5rem 1rem', gap: '0.5rem' }}>
            <Plus size={16} /> Add Color
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {colors.map((color, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
              <div className="premium-input-group" style={{ margin: 0 }}>
                <input type="text" className="premium-input" placeholder="Color Name (e.g., Royal Blue)" value={color.name} onChange={e => handleColorChange(index, 'name', e.target.value)} required />
              </div>
              <div className="premium-input-group" style={{ margin: 0 }}>
                <input type="text" className="premium-input" placeholder="Color Code (e.g., BL-01 or #1e3a8a)" value={color.code} onChange={e => handleColorChange(index, 'code', e.target.value)} required />
              </div>
              <button type="button" onClick={() => handleRemoveColor(index)} className="btn btn-outline" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--color-error)', borderColor: 'rgba(239, 68, 68, 0.3)' }} disabled={colors.length === 1}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ gap: '0.5rem', width: '250px' }}>
          <Save size={18} /> {isSubmitting ? 'Saving...' : catalogId ? 'Update Catalog' : 'Save Catalog'}
        </button>
      </div>
    </form>
  );
}
