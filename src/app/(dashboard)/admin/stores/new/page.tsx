import StoreForm from "../StoreForm";

export default function NewStorePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '1px' }}>Add <span className="text-gold" style={{ fontWeight: 600 }}>Store</span></h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Register a new retail branch or headquarters.</p>
      </div>

      <div className="card">
        <StoreForm />
      </div>
    </div>
  );
}
