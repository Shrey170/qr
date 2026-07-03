import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "STAFF" && session.user.role !== "ADMIN")) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col hidden md:flex">
        <div className="p-4">
          <h2 className="text-xl font-bold text-orange-500">TableServe Staff</h2>
          <p className="text-sm text-gray-400 mt-1">Logged in as {session.user.name}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <a href="/dashboard" className="block px-4 py-2 rounded bg-slate-800 text-white font-medium">Active Orders</a>
          <a href="/dashboard/tables" className="block px-4 py-2 rounded hover:bg-slate-800 text-gray-300">Tables</a>
          {session.user.role === "ADMIN" && (
            <a href="/admin" className="block px-4 py-2 rounded hover:bg-slate-800 text-gray-300 mt-4 border-t border-slate-700 pt-4">Admin Panel</a>
          )}
        </nav>
      </aside>
      
      <main className="flex-1 p-6 h-screen overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
