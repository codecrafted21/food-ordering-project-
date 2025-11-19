import AdminPageClient from "@/components/admin/admin-page-client";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-headline font-bold mb-6">Live Orders</h1>
      <AdminPageClient />
    </div>
  );
}