import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Transporter from "@/models/Transporter";
import TransporterForm from "../../TransporterForm";

export default async function EditTransporterPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "Admin") {
    redirect("/dashboard");
  }

  await dbConnect();
  const t = await Transporter.findById((await params).id).lean();
  
  if (!t) {
    redirect("/transporters");
  }

  const data = {
    ...t,
    _id: t._id.toString()
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '1px' }}>Edit <span className="text-gold" style={{ fontWeight: 600 }}>Logistics</span></h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Update details for {t.name}.</p>
      </div>

      <div className="card">
        <TransporterForm initialData={data} />
      </div>
    </div>
  );
}
