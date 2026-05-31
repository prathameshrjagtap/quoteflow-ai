import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const navClass = ({ isActive }) =>
    `block px-3 py-2 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-blue-600 shadow-lg shadow-blue-600/20 text-white font-semibold"
        : "text-white hover:bg-slate-800 hover:text-blue-400"
    }`;

  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-800 p-6">
      <h1 className="text-2xl font-bold mb-10">
        QuoteFlow AI
      </h1>

      <nav className="space-y-2">
        <NavLink to="/" className={navClass} end>
          Dashboard
        </NavLink>

        <NavLink to="/create-quote" className={navClass}>
          Create Quote
        </NavLink>

        <NavLink to="/quotes" className={navClass}>
          Quotes
        </NavLink>

        <button className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-blue-400">
          Customers
        </button>

        <button className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-blue-400">
          Settings
        </button>
      </nav>
    </aside>
  );
}