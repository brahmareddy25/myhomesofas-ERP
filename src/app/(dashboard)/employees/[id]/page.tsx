import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Link from "next/link";
import { ArrowLeft, Edit, MapPin, Phone, Calendar, Briefcase, DollarSign, User as UserIcon, Building2, CheckCircle, Clock } from "lucide-react";
import Store from "@/models/Store";
import Payslip from "@/models/Payslip";

export default async function ViewEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await dbConnect();
  
  const employee = await Employee.findById(resolvedParams.id).populate({ path: 'storeId', model: Store }).lean() as any;
  if (!employee) redirect("/employees");

  const payslips = await Payslip.find({ employeeId: employee._id }).sort({ paymentDate: -1 }).lean() as any[];

  return (
    <div className="flex flex-col gap-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/employees" className="btn btn-outline" style={{ padding: '0.5rem' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Employee Profile</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>View complete employment details.</p>
          </div>
        </div>
        <Link href={`/employees/${employee._id}/edit`} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Edit size={18} /> Edit Profile
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Left Column: Personal Info */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-surface-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--color-gold-primary)' }}>
              <UserIcon size={40} />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{employee.firstName} {employee.lastName}</h4>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{employee.designation}</p>
            <span style={{ 
              padding: '0.25rem 0.75rem', 
              borderRadius: 'var(--radius-full)', 
              fontSize: '0.75rem', 
              fontWeight: 600,
              backgroundColor: employee.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: employee.isActive ? 'var(--color-success)' : 'var(--color-error)'
            }}>
              {employee.isActive ? 'Active Employee' : 'Inactive'}
            </span>
          </div>

          <hr style={{ borderColor: 'var(--color-border)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <Phone size={18} style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }} />
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Contact Number</p>
                <p style={{ fontWeight: 500 }}>{employee.contactNumber}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <MapPin size={18} style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }} />
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Residential Address</p>
                <p style={{ fontWeight: 500 }}>{employee.address}</p>
              </div>
            </div>
            
            {employee.storeId && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Building2 size={18} style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Assigned Store</p>
                  <p style={{ fontWeight: 500 }}>{employee.storeId.storeName} ({employee.storeId.city})</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Employment & Payroll */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-50)' }}>
              <h4 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={18} className="text-gold" /> Employment Information
              </h4>
            </div>
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Date of Joining</p>
                <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{new Date(employee.dateOfJoining).toLocaleDateString()}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Designation</p>
                <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{employee.designation}</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-50)' }}>
              <h4 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={18} className="text-gold" /> Payroll Details
              </h4>
            </div>
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Compensation Structure</p>
                <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{employee.salaryType}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Base Salary</p>
                <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-gold-primary)' }}>₹{employee.baseSalary.toLocaleString()}</p>
              </div>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h5 style={{ fontWeight: 600 }}>Disbursement History</h5>
                <Link href={`/employees/${employee._id}/disburse`} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                  + Process Salary
                </Link>
              </div>
              
              {payslips.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                  No salary disbursements recorded yet.
                </p>
              ) : (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {payslips.map(ps => (
                    <li key={ps._id.toString()} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--color-surface-100)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ps.month} {ps.year}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {new Date(ps.paymentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, color: 'var(--color-gold-primary)' }}>₹{ps.netPay.toLocaleString()}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Base: ₹{ps.baseSalary} | Bonus: ₹{ps.bonus} | Ded: ₹{ps.deductions}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
