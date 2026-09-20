import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  History,
  Utensils,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks.ts';
import { clearUser } from '@/store/slices/authSlice.ts';
import { UserRoleENUM } from '@/types/user/UserRoleENUM.ts';

interface NavItem {
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',     icon: LayoutDashboard, to: '/admin' },
  { label: 'Employees',     icon: Users,           to: '/admin/employee' },
  { label: 'Orders',        icon: ClipboardList,   to: '/orders' },
  { label: 'Order History', icon: History,         to: '/order-history' },
  { label: 'Menu',          icon: Utensils,        to: '/menu' },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const isEmployee = user?.role === UserRoleENUM.EMPLOYEE;
  const visibleNavItems = isEmployee
    ? NAV_ITEMS.filter((item) => item.label === 'Menu')
    : NAV_ITEMS;

  function handleLogout() {
    dispatch(clearUser());
    navigate('/login');
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <span className="font-display text-lg font-bold tracking-tight text-soroco-cream">
            Soroco House
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-soroco-cream/70 hover:text-soroco-cream hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full" />
            ) : (
              <div className="w-9 h-9 bg-soroco-amber/30 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-soroco-cream" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-body font-semibold text-soroco-cream text-sm truncate">{user.name}</p>
              <p className="font-body text-soroco-cream/50 text-xs truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {visibleNavItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            onClick={onClose}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-body font-medium text-sm transition-colors duration-200 ${
                isActive
                  ? 'text-soroco-cream'
                  : 'text-soroco-cream/60 hover:text-soroco-cream hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="admin-nav-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-soroco-amber/90 to-soroco-sienna shadow-warm-md"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <Icon className="w-4 h-4 shrink-0 relative z-10" />
                <span className="relative z-10">{label}</span>
                {isActive && (
                  <span className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-white/90" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-soroco-cream flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-gradient-to-b from-soroco-espresso via-soroco-charcoal to-soroco-espresso fixed top-0 left-0 h-screen z-30 overflow-hidden shadow-warm-xl">
        {/* Ambience glow */}
        <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 bg-soroco-amber/15 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -right-16 w-64 h-64 bg-soroco-sienna/20 rounded-full blur-3xl" />
        <SidebarContent />
      </aside>

      {/* Mobile overlay + drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overlay lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-screen w-72 bg-gradient-to-b from-soroco-espresso via-soroco-charcoal to-soroco-espresso z-50 lg:hidden overflow-hidden"
            >
              <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 bg-soroco-amber/15 rounded-full blur-3xl" />
              <SidebarContent onClose={() => setIsMobileMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-soroco-cream border-b border-soroco-linen px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="btn-icon shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-soroco-espresso" />
          </button>
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <span className="font-display font-bold tracking-tight text-soroco-espresso text-base">
                {title ?? 'Soroco House'}
              </span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
