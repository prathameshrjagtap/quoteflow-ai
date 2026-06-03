import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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

  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-800 p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-10">QuoteFlow AI</h1>

      <nav className="space-y-2 flex-1">
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

      {/* User info + sign out */}
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
    </aside>
  );
}
