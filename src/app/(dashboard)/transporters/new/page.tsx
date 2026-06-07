import TransporterForm from "../TransporterForm";

export default function NewTransporterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '1px' }}>Add <span className="text-gold" style={{ fontWeight: 600 }}>Logistics</span></h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Register a new transport partner or vehicle.</p>
      </div>

      <div className="card">
        <TransporterForm />
      </div>
    </div>
  );
}
