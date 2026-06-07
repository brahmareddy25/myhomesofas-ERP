"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Store as StoreIcon } from "lucide-react";

export default function StoreSelector({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    if (role === "Admin") {
      fetch("/api/stores")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setStores(data);
            if (data.length > 0 && !value) {
              onChange(data[0]._id);
            }
          }
        })
        .catch(console.error);
    }
  }, [role, value, onChange]);

  if (role !== "Admin") return null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--color-gold-primary)', marginBottom: '1.5rem' }}>
      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-gold-primary)' }}>
        <StoreIcon size={20} /> Assign to Store
      </h4>
      <div className="premium-input-group">
        <select className="premium-input" value={value} onChange={e => onChange(e.target.value)} required>
          {stores.length === 0 && <option value="" disabled>Loading stores...</option>}
          {stores.map(store => (
            <option key={store._id} value={store._id}>{store.storeName} ({store.city})</option>
          ))}
        </select>
        <label className="premium-label">Select Store</label>
      </div>
    </div>
  );
}
