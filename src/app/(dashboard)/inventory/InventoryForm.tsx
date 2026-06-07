"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Package, DollarSign, Archive, Tags } from "lucide-react";
import StoreSelector from "@/components/ui/StoreSelector";
import toast from 'react-hot-toast';

export default function InventoryForm({ initialData, inventoryId }: { initialData?: any, inventoryId?: string }) {
  const router = useRouter();
  const [storeId, setStoreId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [itemName, setItemName] = useState(initialData?.itemName || "");
  const [category, setCategory] = useState(initialData?.category || "Raw Material");
  const [quantityInStock, setQuantityInStock] = useState(initialData?.quantityInStock || 0);
  const [unitOfMeasurement, setUnitOfMeasurement] = useState(initialData?.unitOfMeasurement || "Pieces");
  const [reorderLevel, setReorderLevel] = useState(initialData?.reorderLevel || 10);
  const [unitCost, setUnitCost] = useState(initialData?.unitCost || "");
  const [supplierName, setSupplierName] = useState(initialData?.supplierName || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        itemName,
        category,
        quantityInStock: Number(quantityInStock),
        unitOfMeasurement,
        reorderLevel: Number(reorderLevel),
        unitCost: Number(unitCost),
        supplierName,
        storeId: storeId || undefined
};

      const url = inventoryId ? `/api/inventory/${inventoryId}` : "/api/inventory";
      const method = inventoryId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`Inventory Item ${inventoryId ? 'Updated' : 'Created'} Successfully!`);
        router.push("/inventory");
      } else {
        const error = await res.json();
        toast.error("Error saving inventory item: " + error.error);
      }
    } catch (err) {
      toast.error("Failed to connect to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Store Selector */}
      {!initialData && <StoreSelector value={storeId} onChange={setStoreId} />}
      
      {/* Item Details */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <Package size={20} className="text-gold" /> Item Information
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="premium-input-group">
            <input type="text" className="premium-input" required value={itemName} onChange={e => setItemName(e.target.value)} />
            <label className="premium-label">Item Name *</label>
          </div>
          <div className="premium-input-group">
            <select className="premium-input" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Raw Material">Raw Material</option>
              <option value="Finished Goods">Finished Goods</option>
              <option value="Tools">Tools</option>
              <option value="Packaging">Packaging</option>
              <option value="Other">Other</option>
            </select>
            <label className="premium-label">Category</label>
          </div>
          <div className="premium-input-group">
            <input type="text" className="premium-input" value={supplierName} onChange={e => setSupplierName(e.target.value)} />
            <label className="premium-label">Supplier Name</label>
          </div>
        </div>
      </div>

      {/* Stock & Pricing */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <Archive size={20} className="text-gold" /> Stock & Pricing
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="premium-input-group">
            <input type="number" className="premium-input" required value={quantityInStock} onChange={e => setQuantityInStock(e.target.value)} />
            <label className="premium-label">Quantity In Stock *</label>
          </div>
          <div className="premium-input-group">
            <select className="premium-input" value={unitOfMeasurement} onChange={e => setUnitOfMeasurement(e.target.value)}>
              <option value="Pieces">Pieces</option>
              <option value="Meters">Meters</option>
              <option value="Kg">Kg</option>
              <option value="Liters">Liters</option>
              <option value="Rolls">Rolls</option>
            </select>
            <label className="premium-label">Unit of Measurement</label>
          </div>
          
          <div className="premium-input-group">
            <input type="number" className="premium-input" required value={unitCost} onChange={e => setUnitCost(e.target.value)} />
            <label className="premium-label">Unit Cost *</label>
          </div>
          <div className="premium-input-group">
            <input type="number" className="premium-input" required value={reorderLevel} onChange={e => setReorderLevel(e.target.value)} />
            <label className="premium-label">Reorder Level *</label>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ gap: '0.5rem', width: '250px' }}>
          <Save size={18} /> {isSubmitting ? 'Saving...' : inventoryId ? 'Update Item' : 'Save Item'}
        </button>
      </div>
    </form>
  );
}
