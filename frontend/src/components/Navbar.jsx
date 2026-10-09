import { useState } from "react";
import { NavLink } from "react-router";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { theme, toggleTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      name: "Analysis",
      path: "/analysis",
    },
    {
      name: "History",
      path: "/history",
    },
    {
      name: "About",
      path: "/about",
    },
  ];

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#04100c]/80 backdrop-blur-xl">

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* LOGO */}

        <NavLink
          to="/"
          className="flex items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-xl text-black shadow-lg shadow-emerald-400/10">
            🌱
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight">
              AgriSentinal
            </p>

            <p className="text-[8px] uppercase tracking-[0.2em] text-gray-600">
              Sowing Analyzer
            </p>
          </div>
        </NavLink>

        {/* DESKTOP NAV */}

        <div className="hidden items-center gap-1 md:flex">

          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `rounded-xl px-4 py-2.5 text-xs transition ${
                  isActive
                    ? "bg-emerald-400/10 text-emerald-400"
                    : "text-gray-500 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-3">

          {/* THEME */}

          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm transition hover:border-emerald-400/30"
            title="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* MOBILE */}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-lg md:hidden"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>

        </div>

      </div>

      {/* MOBILE MENU */}

      {mobileOpen && (
        <div className="border-t border-white/5 bg-[#04100c] px-6 py-5 md:hidden">

          <div className="space-y-2">

            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm ${
                    isActive
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "text-gray-500"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

          </div>

        </div>
      )}

    </nav>
  );
}

export default Navbar;