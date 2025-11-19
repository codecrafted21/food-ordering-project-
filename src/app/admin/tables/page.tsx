import { TABLES, WAITERS } from '@/lib/data';
import { TableManagementClient } from '@/components/admin/table-management-client';

export default function TablesPage() {
  return (
    <>
      <header className="flex h-16 items-center border-b bg-card px-4 lg:px-6 sticky top-0 z-30">
        <h1 className="flex-1 text-lg font-semibold">Table Management</h1>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <TableManagementClient tables={TABLES} waiters={WAITERS} />
      </div>
    </>
  );
}
