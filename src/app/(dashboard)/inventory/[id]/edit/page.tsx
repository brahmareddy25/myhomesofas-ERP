"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import InventoryForm from "../../InventoryForm";

export default function EditInventoryPage() {
  const params = useParams();
  const id = params.id as string;
  const [inventoryItem, setInventoryItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/inventory/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.inventory) {
          setInventoryItem(data.inventory);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (!inventoryItem) return <div>Inventory item not found</div>;

  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.6s ease', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 300, letterSpacing: '1px' }}>
          Edit <span className="text-gold" style={{ fontWeight: 600 }}>Inventory Item</span>
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Update an existing inventory item.
        </p>
      </div>

      <InventoryForm initialData={inventoryItem} inventoryId={id} />
    </div>
  );
}
