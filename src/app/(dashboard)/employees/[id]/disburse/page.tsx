import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Store from "@/models/Store";
import DisburseForm from "./DisburseForm";

export default async function SalaryDisbursementPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await dbConnect();
  
  const employee = await Employee.findById(resolvedParams.id).populate({ path: 'storeId', model: Store }).lean() as any;
  if (!employee) redirect("/employees");

  // Format data for client component
  const employeeData = JSON.parse(JSON.stringify(employee));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '1px' }}>Process <span className="text-gold" style={{ fontWeight: 600 }}>Salary Disbursement</span></h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Generate payslip for {employee.firstName} {employee.lastName} ({employee.designation})
        </p>
      </div>

      <div className="card">
        <DisburseForm employee={employeeData} />
      </div>
    </div>
  );
}
