import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import NepaliDate from "nepali-date-converter";
import { LayoutDashboard, Calculator, TrendingUp, BookOpen, Home, CalendarDays, Menu, X, Languages } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

const navItems = [
  { to: "/", key: "dashboard" as const, icon: LayoutDashboard },
  { to: "/calculator", key: "calculator" as const, icon: Calculator },
  { to: "/strategy", key: "strategy" as const, icon: TrendingUp },
  { to: "/accounting", key: "accounting" as const, icon: BookOpen },
  { to: "/rent", key: "rent" as const, icon: Home },
  { to: "/calendar", key: "calendar" as const, icon: CalendarDays },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { t, lang, toggleLang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const todayBsLabel = NepaliDate.now().format("DD MMMM, YYYY", lang === "ne" ? "np" : "en");

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-lg font-bold text-amber-300">
              घर
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-stone-900 sm:text-base">{t.brand.name}</p>
              <p className="text-xs text-stone-500">{t.brand.tagline}</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map(({ to, key, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? "bg-emerald-700 text-white" : "text-stone-600 hover:bg-stone-100"
                  }`
                }
              >
                <Icon size={16} />
                {t.nav[key]}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <NavLink
              to="/calendar"
              className="hidden items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 sm:flex"
              title={t.nav.calendar}
            >
              <CalendarDays size={16} className="text-emerald-700" />
              {todayBsLabel}
            </NavLink>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
              aria-label="Toggle language"
            >
              <Languages size={16} />
              {lang === "en" ? "नेपाली" : "English"}
            </button>
            <button
              className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="flex flex-col gap-1 border-t border-stone-200 bg-white px-4 py-3 lg:hidden">
            {navItems.map(({ to, key, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? "bg-emerald-700 text-white" : "text-stone-600 hover:bg-stone-100"
                  }`
                }
              >
                <Icon size={16} />
                {t.nav[key]}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>

      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400">
        {t.footer.text}
      </footer>
    </div>
  );
}
