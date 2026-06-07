import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import StoreForm from "../../StoreForm";

export default async function EditStorePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "Admin") {
    redirect("/dashboard");
  }

  await dbConnect();
  const store = await Store.findById((await params).id).lean();
  
  if (!store) {
    redirect("/admin/stores");
  }

  // Fetch the associated user to get the username
  const mongoose = (await import('mongoose')).default;
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
  const user = await User.findOne({ storeId: store._id, role: 'Store' }).lean();

  const storeData = JSON.parse(JSON.stringify({
    ...store,
    _id: store._id.toString(),
    username: user?.username || ""
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '1px' }}>Edit <span className="text-gold" style={{ fontWeight: 600 }}>Store</span></h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Update details for {store.storeName}.</p>
      </div>

      <div className="card">
        <StoreForm initialData={storeData} />
      </div>
    </div>
  );
}
