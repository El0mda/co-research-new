import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { Bell, Menu, X, User, LogOut, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  const { t, toggleLang, lang } = useLang();
  const { isLoggedIn, setIsLoggedIn, user } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground font-heading">CR</span>
          </div>
          <span className="font-heading text-lg font-bold text-foreground">{t('brand')}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.home')}</Link>
          {isLoggedIn && (
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.dashboard')}</Link>
          )}

          <button
            onClick={toggleLang}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
          >
            {t('nav.langToggle')}
          </button>

          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-secondary transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {(lang === 'ar' ? user.name : user.nameEn).charAt(0)}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {dropdownOpen && (
                <div className="absolute end-0 top-full mt-2 w-48 rounded-lg border border-border bg-card p-1 shadow-lg">
                  <Link
                    to={`/profile/${user.id}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary transition-colors"
                  >
                    <User className="h-4 w-4" />
                    {t('nav.myProfile')}
                  </Link>
                  <button
                    onClick={() => { setIsLoggedIn(false); setDropdownOpen(false); navigate('/'); }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary transition-colors text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('nav.signOut')}
                  </button>
                </div>
              )}
              <div className="relative ms-2 inline-block">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute -top-1 -end-1 h-2.5 w-2.5 rounded-full bg-destructive" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setIsLoggedIn(true); navigate('/dashboard'); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('nav.signIn')}
              </button>
              <Link
                to="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-3">
          <Link to="/" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>{t('nav.home')}</Link>
          {isLoggedIn && <Link to="/dashboard" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>{t('nav.dashboard')}</Link>}
          <button onClick={() => { toggleLang(); setMobileOpen(false); }} className="block text-sm py-2">{t('nav.langToggle')}</button>
          {!isLoggedIn && (
            <>
              <button onClick={() => { setIsLoggedIn(true); navigate('/dashboard'); setMobileOpen(false); }} className="block text-sm py-2">{t('nav.signIn')}</button>
              <Link to="/register" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>{t('nav.register')}</Link>
            </>
          )}
          {isLoggedIn && (
            <>
              <Link to={`/profile/${user.id}`} className="block text-sm py-2" onClick={() => setMobileOpen(false)}>{t('nav.myProfile')}</Link>
              <button onClick={() => { setIsLoggedIn(false); setMobileOpen(false); navigate('/'); }} className="block text-sm py-2 text-destructive">{t('nav.signOut')}</button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
