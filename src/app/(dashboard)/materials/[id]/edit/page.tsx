"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MaterialForm from "../../MaterialForm";

export default function EditMaterialCatalogPage() {
  const params = useParams();
  const id = params.id as string;
  const [catalog, setCatalog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/material-catalogs/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.catalog) {
          setCatalog(data.catalog);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (!catalog) return <div>Catalog not found</div>;

  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.6s ease', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 300, letterSpacing: '1px' }}>
          Edit <span className="text-gold" style={{ fontWeight: 600 }}>Material Catalog</span>
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Update an existing fabric collection or its colors.
        </p>
      </div>

      <MaterialForm initialData={catalog} catalogId={id} />
    </div>
  );
}
