import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import { useApp } from "@/contexts/AppContext";
import { Bell, Menu, X, User, LogOut, ChevronDown } from "lucide-react";

const Header: React.FC = () => {
  const { t, toggleLang, lang } = useLang();
  const { isLoggedIn, setIsLoggedIn, user } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-white border-b border-border/60"
      }`}
    >
      <div className="container flex h-[68px] items-center justify-between">
        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="Co-research"
            className="h-[70px] w-auto transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-7">
          <Link to="/" className="header-nav-link">
            {t("nav.home")}
          </Link>
          {isLoggedIn && (
            <Link to="/dashboard" className="header-nav-link">
              {t("nav.dashboard")}
            </Link>
          )}

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-md transition-all duration-200"
            style={{
              color: "hsl(var(--navy))",
              border: "1px solid hsl(var(--navy) / 0.2)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "hsl(var(--navy-surface))";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "hsl(var(--navy) / 0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "hsl(var(--navy) / 0.2)";
            }}
          >
            {t("nav.langToggle")}
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              {/* Bell */}
              <button className="relative p-1.5 rounded-md hover:bg-secondary transition-colors">
                <Bell
                  className="h-[18px] w-[18px]"
                  style={{ color: "hsl(var(--navy) / 0.5)" }}
                />
                <span
                  className="absolute top-1 end-1 h-2 w-2 rounded-full"
                  style={{ background: "hsl(4 72% 50%)" }}
                />
              </button>

              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-secondary"
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold"
                    style={{
                      background: "hsl(var(--navy-deep))",
                      color: "hsl(var(--gold))",
                    }}
                  >
                    {(lang === "ar" ? user.name : user.nameEn).charAt(0)}
                  </div>
                  <span
                    className="text-sm font-medium hidden lg:block"
                    style={{ color: "hsl(var(--navy))" }}
                  >
                    {lang === "ar" ? user.name : user.nameEn}
                  </span>
                  <ChevronDown
                    className="h-3.5 w-3.5 transition-transform duration-200"
                    style={{
                      color: "hsl(var(--muted-foreground))",
                      transform: dropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute end-0 top-full mt-2 w-52 rounded-xl p-1.5 animate-scale-in"
                    style={{
                      background: "white",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 8px 32px hsl(222 25% 12% / 0.12)",
                    }}
                  >
                    {/* User info row */}
                    <div
                      className="px-3 py-2.5 mb-1"
                      style={{ borderBottom: "1px solid hsl(var(--border))" }}
                    >
                      <p
                        className="text-[13px] font-semibold"
                        style={{ color: "hsl(var(--navy-deep))" }}
                      >
                        {lang === "ar" ? user.name : user.nameEn}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                      >
                        {user.university}
                      </p>
                    </div>
                    <Link
                      to={`/profile/${user.id}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
                      style={{ color: "hsl(var(--navy))" }}
                    >
                      <User className="h-3.5 w-3.5" />
                      {t("nav.myProfile")}
                    </Link>
                    <button
                      onClick={() => {
                        setIsLoggedIn(false);
                        setDropdownOpen(false);
                        navigate("/");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-red-50"
                      style={{ color: "hsl(var(--destructive))" }}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      {t("nav.signOut")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsLoggedIn(true);
                  navigate("/dashboard");
                }}
                className="text-sm font-medium transition-colors"
                style={{ color: "hsl(var(--navy) / 0.65)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "hsl(var(--navy))")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "hsl(var(--navy) / 0.65))")
                }
              >
                {t("nav.signIn")}
              </button>
              <Link
                to="/register"
                className="btn-primary text-sm"
                style={{ padding: "0.5rem 1.25rem" }}
              >
                {t("nav.register")}
              </Link>
            </div>
          )}
        </nav>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden p-2 rounded-md transition-colors hover:bg-secondary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" style={{ color: "hsl(var(--navy))" }} />
          ) : (
            <Menu className="h-5 w-5" style={{ color: "hsl(var(--navy))" }} />
          )}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div
          className="md:hidden p-4 space-y-1 animate-fade-in"
          style={{
            background: "white",
            borderTop: "1px solid hsl(var(--border))",
          }}
        >
          <MobileLink
            to="/"
            label={t("nav.home")}
            onClick={() => setMobileOpen(false)}
          />
          {isLoggedIn && (
            <MobileLink
              to="/dashboard"
              label={t("nav.dashboard")}
              onClick={() => setMobileOpen(false)}
            />
          )}
          <button
            onClick={() => {
              toggleLang();
              setMobileOpen(false);
            }}
            className="block w-full text-start px-3 py-2.5 rounded-lg text-sm hover:bg-secondary transition-colors"
            style={{ color: "hsl(var(--navy))" }}
          >
            {t("nav.langToggle")}
          </button>
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  setIsLoggedIn(true);
                  navigate("/dashboard");
                  setMobileOpen(false);
                }}
                className="block w-full text-start px-3 py-2.5 rounded-lg text-sm hover:bg-secondary transition-colors"
                style={{ color: "hsl(var(--navy))" }}
              >
                {t("nav.signIn")}
              </button>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold mt-2 btn-primary"
              >
                {t("nav.register")}
              </Link>
            </>
          ) : (
            <>
              <MobileLink
                to={`/profile/${user.id}`}
                label={t("nav.myProfile")}
                onClick={() => setMobileOpen(false)}
              />
              <button
                onClick={() => {
                  setIsLoggedIn(false);
                  setMobileOpen(false);
                  navigate("/");
                }}
                className="block w-full text-start px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-red-50"
                style={{ color: "hsl(var(--destructive))" }}
              >
                {t("nav.signOut")}
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

const MobileLink: React.FC<{
  to: string;
  label: string;
  onClick: () => void;
}> = ({ to, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
    style={{ color: "hsl(var(--navy))" }}
  >
    {label}
  </Link>
);

export default Header;
