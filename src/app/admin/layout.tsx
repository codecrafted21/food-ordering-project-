import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Logo } from "@/components/shared/logo";
import { LogoutButton } from "@/components/admin/logout-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:px-6">
            <Logo />
          </div>
          <div className="flex-1">
            <AdminSidebar />
          </div>
          <div className="mt-auto p-4">
            <LogoutButton />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {/* The header is now part of the main content area, allowing pages to control their own titles */}
        <main className="flex flex-1 flex-col bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
