"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, FileText, CheckCircle, Edit, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/employees")
      .then(res => res.json())
      .then(data => {
        if (data.employees) {
          setEmployees(data.employees);
        }
      });
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.6s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '1px' }}>Staff & <span className="text-gold" style={{ fontWeight: 600 }}>Payroll</span></h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Manage employee profiles and salary disbursements.</p>
        </div>
        <button onClick={() => router.push("/employees/new")} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <UserPlus size={18} /> Onboard Employee
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Employee Name</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Designation</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Contact Number</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem' }}>Compensation Structure</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1px', fontSize: '0.75rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background var(--transition-fast)' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1.5rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-gold-dark), var(--color-gold-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 600, fontSize: '1.1rem', boxShadow: 'var(--shadow-glow)' }}>
                      {emp.firstName?.charAt(0)}
                    </div>
                    <div>
                      <span style={{ display: 'block' }}>{emp.firstName} {emp.lastName}</span>
                      <span style={{ fontSize: '0.75rem', color: emp.isActive ? 'var(--color-success)' : 'var(--color-error)' }}>{emp.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.5rem', color: 'var(--color-text-secondary)' }}>{emp.designation}</td>
                <td style={{ padding: '1.5rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace', fontSize: '1rem' }}>{emp.contactNumber}</td>
                <td style={{ padding: '1.5rem' }}>
                  <span style={{ 
                    padding: '0.35rem 0.85rem', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.75rem',
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-gold-light)',
                    letterSpacing: '0.5px'
                  }}>
                    {emp.salaryType} (₹{emp.baseSalary})
                  </span>
                </td>
                <td style={{ padding: '1.5rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button onClick={() => router.push(`/employees/${emp._id}`)} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }} title="View Details">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => router.push(`/employees/${emp._id}/edit`)} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }} title="Edit Employee">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => router.push(`/employees/${emp._id}/disburse`)} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }} title="Process Salary Disbursement">
                    <FileText size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  No employees found. Click "Onboard Employee" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
