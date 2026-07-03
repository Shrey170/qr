import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/api/auth/signin");
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-orange-500">Admin Panel</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/admin" className="block px-4 py-2 rounded hover:bg-slate-800">Dashboard</Link>
          <Link href="/admin/menu" className="block px-4 py-2 rounded hover:bg-slate-800">Menu Manager</Link>
          <Link href="/admin/tables" className="block px-4 py-2 rounded hover:bg-slate-800">Table QR Codes</Link>
          <Link href="/admin/bills" className="block px-4 py-2 rounded hover:bg-slate-800">Bills History</Link>
          <Link href="/dashboard" className="block px-4 py-2 rounded hover:bg-slate-800 text-gray-400 mt-8 border-t border-slate-700 pt-4">Staff View</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
