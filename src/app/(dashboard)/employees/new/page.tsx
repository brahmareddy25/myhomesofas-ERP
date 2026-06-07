"use client";

import EmployeeForm from "../EmployeeForm";

export default function NewEmployeePage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.6s ease', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 300, letterSpacing: '1px' }}>
          New <span className="text-gold" style={{ fontWeight: 600 }}>Employee</span>
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Register a new employee profile.
        </p>
      </div>

      <EmployeeForm />
    </div>
  );
}
