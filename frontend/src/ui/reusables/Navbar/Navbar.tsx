import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu as MenuIcon, X, User, LogOut, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store/hooks.ts';
import { clearUser } from '@/store/slices/authSlice.ts';

const NAV_LINKS = [
  { label: 'Menu',    href: '/menu' },
  { label: 'Orders',  href: '/orders' },
];

export default function Navbar() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const dispatch   = useAppDispatch();

  const cartItems      = useAppSelector((s) => s.cart.items);
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  /* ── Scroll listener ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Close mobile drawer on route change ── */
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  /* ── Close user menu on outside click ── */
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [userMenuOpen]);

  /* ── Lock body scroll when drawer is open ── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  function handleLogout() {
    dispatch(clearUser());
    setUserMenuOpen(false);
    navigate('/');
  }

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* ── Main nav bar ── */}
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-warm'
            : 'bg-transparent',
        ].join(' ')}
        style={{ height: 'var(--nav-height)' }}
      >
        <div className="section-container h-full flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            to="/"
            className="font-display font-bold text-soroco-espresso text-xl sm:text-2xl shrink-0 tracking-tight hover:opacity-80 transition-opacity"
          >
            Soroco House
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={[
                  'nav-link pb-0.5',
                  isActive(link.href) ? 'nav-link-active' : '',
                ].join(' ')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-2">

            {/* Cart button */}
            <Link
              to="/cart"
              className="btn-icon relative"
              aria-label={`Cart (${cartCount} items)`}
            >
              <ShoppingBag className="w-5 h-5 text-soroco-espresso" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-soroco-amber text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-cart-bounce">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Auth area */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 btn-ghost text-sm rounded-full px-3 py-2"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-soroco-amber/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-soroco-amber" />
                  </div>
                  <span className="text-soroco-espresso font-medium max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-soroco-mocha transition-transform duration-200 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-warm-md border border-soroco-linen overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-soroco-linen">
                        <p className="text-xs text-soroco-tan font-semibold uppercase tracking-widest">
                          {user.role}
                        </p>
                        <p className="text-sm font-medium text-soroco-charcoal truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-secondary text-sm px-5 py-2">
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile right actions */}
          <div className="flex md:hidden items-center gap-1">
            <Link
              to="/cart"
              className="btn-icon relative"
              aria-label={`Cart (${cartCount} items)`}
            >
              <ShoppingBag className="w-5 h-5 text-soroco-espresso" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-soroco-amber text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className="btn-icon"
              aria-label="Open menu"
            >
              <MenuIcon className="w-5 h-5 text-soroco-espresso" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-soroco-charcoal/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-warm-xl flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-soroco-linen">
                <span className="font-display font-bold text-soroco-espresso text-xl">
                  Soroco House
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="btn-icon"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-soroco-espresso" />
                </button>
              </div>

              {/* Drawer links */}
              <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={[
                      'flex items-center gap-3 px-4 py-3 rounded-xl font-body font-medium text-base transition-colors duration-150',
                      isActive(link.href)
                        ? 'bg-soroco-amber/10 text-soroco-espresso'
                        : 'text-soroco-mocha hover:bg-soroco-linen hover:text-soroco-espresso',
                    ].join(' ')}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Drawer footer — auth */}
              <div className="px-4 py-5 border-t border-soroco-linen">
                {isAuthenticated && user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-9 h-9 rounded-full bg-soroco-amber/15 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-soroco-amber" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-soroco-charcoal truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-soroco-tan truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-600 bg-red-50 hover:bg-red-100 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="btn-primary w-full">
                    Sign in
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
