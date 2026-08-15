import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Waves } from 'lucide-react';
import { useEffect, useState } from 'react';
import { settingsAPI } from '../lib/settingsAPI';

const NAV_ITEMS = [
  { to: '/', label: 'หน้าหลัก' },
  { to: '/rooms', label: 'ห้องพัก' },
  { to: '/dashboard', label: 'ค้นหาการจอง' },
];

export function Header() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await settingsAPI.getAll();
      setFirstName(settings.siteName);
      setLastName(settings.siteNameSecondPart);
    };
    fetchSettings();
  }, []);

  // Nav tightens and gains contrast once the hero scrolls past
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'top-2 sm:top-3' : 'top-4 sm:top-6'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div
          className={`flex items-center justify-between rounded-full pl-5 pr-3 sm:pl-7 sm:pr-4 transition-all duration-500 ${
            scrolled
              ? 'py-2.5 bg-white/85 backdrop-blur-xl border border-white/70 shadow-float'
              : 'py-3.5 bg-white/60 backdrop-blur-lg border border-white/50 shadow-glass'
          }`}
        >
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group" onClick={closeMenu}>
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-aqua-600 text-white transition-transform duration-500 group-hover:scale-105">
              <Waves className="h-5 w-5" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-lg font-medium text-aqua-800">
                {firstName}
              </span>
              <span className="block font-display text-[0.7rem] font-light uppercase tracking-[0.25em] text-aqua-400">
                {lastName}
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-aqua-800'
                      : 'text-aqua-500 hover:text-aqua-800 hover:bg-aqua-50/70'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-5 -bottom-0.5 h-0.5 rounded-full bg-sun-400" />
                  )}
                </Link>
              );
            })}
            <Link
              to="/rooms"
              className="ml-2 rounded-full bg-sun-400 px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-sun-500 hover:shadow-glow"
            >
              จองเลย
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-full text-aqua-700 transition-colors hover:bg-aqua-50"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <nav className="md:hidden mt-3 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/70 p-3 shadow-float animate-fade-up">
            <div className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeMenu}
                  className={`rounded-2xl px-5 py-3.5 text-sm font-medium transition-colors ${
                    location.pathname === item.to
                      ? 'bg-aqua-50 text-aqua-800'
                      : 'text-aqua-600 hover:bg-foam-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/rooms"
                onClick={closeMenu}
                className="mt-2 rounded-2xl bg-sun-400 px-5 py-3.5 text-center text-sm font-medium text-white transition-colors hover:bg-sun-500"
              >
                จองเลย
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
