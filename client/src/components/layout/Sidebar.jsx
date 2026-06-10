import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `block px-3 py-2 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-blue-600 shadow-lg shadow-blue-600/20 text-white font-semibold"
        : "text-white hover:bg-slate-800 hover:text-blue-400"
    }`;

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const close = () => setMobileOpen(false);

  const NavContent = () => (
    <>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold">QuoteFlow AI</h1>
        {/* Close button — mobile only */}
        <button
          onClick={close}
          className="md:hidden text-slate-400 hover:text-white p-1"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <nav className="space-y-2 flex-1" onClick={close}>
        <NavLink to="/" className={navClass} end>
          Dashboard
        </NavLink>
        <NavLink to="/create-quote" className={navClass}>
          Create Quote
        </NavLink>
        <NavLink to="/quotes" className={navClass}>
          Quotes
        </NavLink>
        <NavLink to="/customers" className={navClass}>
          Customers
        </NavLink>
        <NavLink to="/settings" className={navClass}>
          Settings
        </NavLink>
      </nav>

      {user && (
        <div className="mt-6 pt-6 border-t border-slate-800">
          <p
            className="text-slate-400 text-xs truncate mb-3"
            title={user.email}
          >
            {user.email}
          </p>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors text-sm"
          >
            Sign Out
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-60 bg-slate-900 border-r border-slate-800 p-6 flex-col shrink-0">
        <NavContent />
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">QuoteFlow AI</h1>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white p-2 rounded-lg hover:bg-slate-800"
          aria-label="Open menu"
        >
          {/* Hamburger icon */}
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white" />
        </button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60"
          onClick={close}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-72 z-50 bg-slate-900 border-r border-slate-800 p-6 flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
}
