export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-xl font-bold text-orange-600">TableServe</h1>
        </div>
      </header>
      <main className="max-w-md mx-auto p-4">{children}</main>
    </div>
  );
}
