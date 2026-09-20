import { Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useAppSelector } from '@/store/hooks.ts';
import { UserRoleENUM } from '@/types/user/UserRoleENUM.ts';
import { ShieldOff } from 'lucide-react';
import DelayedLoader from '@/ui/reusables/BrandLoader/DelayedLoader.tsx';
import RouteErrorBoundary from '@/ui/reusables/RouteErrorBoundary/RouteErrorBoundary.tsx';
import { lazyLoad } from '@/utils/lazyLoad.ts';

/* ─────────────────────────── Lazy Screens ─────────────────────────── */
const HomeScreen         = lazyLoad(() => import('@/ui/screens/HomeScreen/HomeScreen'));
const MenuScreen         = lazyLoad(() => import('@/ui/screens/MenuScreen/MenuScreen'));
const CartScreen         = lazyLoad(() => import('@/ui/screens/CartScreen/CartScreen'));
const CheckoutScreen     = lazyLoad(() => import('@/ui/screens/CheckoutScreen/CheckoutScreen'));
const PaymentScreen      = lazyLoad(() => import('@/ui/screens/PaymentScreen/PaymentScreen'));
const PaymentSuccessScreen   = lazyLoad(() => import('@/ui/screens/PaymentSuccessScreen/PaymentSuccessScreen'));
const PaymentFailedScreen    = lazyLoad(() => import('@/ui/screens/PaymentFailedScreen/PaymentFailedScreen'));
const PaymentCancelledScreen = lazyLoad(() => import('@/ui/screens/PaymentCancelledScreen/PaymentCancelledScreen'));
const LoginScreen        = lazyLoad(() => import('@/ui/screens/LoginScreen/LoginScreen'));
const SignupScreen       = lazyLoad(() => import('@/ui/screens/SignupScreen/SignupScreen'));
const OrdersScreen       = lazyLoad(() => import('@/ui/screens/OrdersScreen/OrdersScreen'));
const AdminScreen        = lazyLoad(() => import('@/ui/screens/AdminScreen/AdminScreen'));
const EmployeeScreen     = lazyLoad(() => import('@/ui/screens/EmployeeScreen/EmployeeScreen'));
const OrderHistoryScreen = lazyLoad(() => import('@/ui/screens/OrderHistoryScreen/OrderHistoryScreen'));
const NotFoundScreen     = lazyLoad(() => import('@/ui/screens/NotFoundScreen/NotFoundScreen'));

/* ─────────────────────────── Loading Spinner ──────────────────────── */
function LoadingSpinner() {
  return <DelayedLoader variant="full" />;
}

/* ─────────────────────────── Unauthorized ──────────────────────────── */
function UnauthorizedScreen() {
  return (
    <div className="min-h-screen bg-soroco-cream flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-soroco-charcoal mb-3">
          Access Denied
        </h1>
        <p className="font-body text-soroco-mocha mb-6 leading-relaxed">
          You don't have permission to view this page. Please contact an
          administrator if you believe this is a mistake.
        </p>
        <a href="/" className="btn-primary">
          Go to Home
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────────── ProtectedRoute ────────────────────────── */
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRoleENUM[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <UnauthorizedScreen />;
  }

  return <>{children}</>;
}

/* ─────────────────────────── AppRouter ─────────────────────────────── */
function AppContent() {
  const location = useLocation();
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RouteErrorBoundary key={location.pathname}>
        <Routes>
          {/* Public */}
          <Route path="/"        element={<HomeScreen />} />
          <Route path="/menu"    element={<MenuScreen />} />
          <Route path="/cart"    element={<CartScreen />} />
          <Route path="/checkout" element={<CheckoutScreen />} />
          <Route path="/payment" element={<PaymentScreen />} />
          <Route path="/payment/success"   element={<PaymentSuccessScreen />} />
          <Route path="/payment/failed"    element={<PaymentFailedScreen />} />
          <Route path="/payment/cancelled" element={<PaymentCancelledScreen />} />
          <Route path="/login"   element={<LoginScreen />} />
          <Route path="/signup"  element={<SignupScreen />} />

          {/* Employee + Admin */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={[UserRoleENUM.EMPLOYEE, UserRoleENUM.ADMIN]}>
                <OrdersScreen />
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={[UserRoleENUM.ADMIN]}>
                <AdminScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employee"
            element={
              <ProtectedRoute allowedRoles={[UserRoleENUM.ADMIN]}>
                <EmployeeScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-history"
            element={
              <ProtectedRoute allowedRoles={[UserRoleENUM.ADMIN]}>
                <OrderHistoryScreen />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundScreen />} />
        </Routes>
      </RouteErrorBoundary>
    </Suspense>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
