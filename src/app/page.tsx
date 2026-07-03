import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">
            Welcome to <span className="text-orange-600">TableServe</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            The next-generation QR ordering system for restaurants. 
            Seamless dining experiences, instant ordering, and real-time staff management.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 max-w-xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">Staff Portal</h2>
            <p className="text-slate-500 text-sm">
              Manage incoming orders, update statuses, and monitor tables in real-time.
            </p>
            <Link href="/dashboard" className="block">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                Staff Dashboard
              </Button>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">Admin Panel</h2>
            <p className="text-slate-500 text-sm">
              Configure menus, generate table QR codes, and view sales analytics.
            </p>
            <Link href="/admin" className="block">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                Admin Settings
              </Button>
            </Link>
          </div>
        </div>

        <div className="pt-12 text-slate-500 text-sm">
          <p>
            To experience the customer flow, log into the Admin panel and copy a Table QR URL.
          </p>
        </div>
      </div>
    </div>
  );
}
