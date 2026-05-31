export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6">
      <h1 className="text-2xl font-bold mb-10">
        QuoteFlow AI
      </h1>

      <nav className="space-y-4">
        <button className="block w-full text-left hover:text-blue-400">
          Dashboard
        </button>

        <button className="block w-full text-left hover:text-blue-400">
          Quotations
        </button>

        <button className="block w-full text-left hover:text-blue-400">
          Customers
        </button>

        <button className="block w-full text-left hover:text-blue-400">
          Settings
        </button>
      </nav>
    </aside>
  );
}