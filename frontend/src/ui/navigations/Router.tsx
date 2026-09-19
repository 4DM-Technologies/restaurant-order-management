import { lazy, Suspense } from 'react';
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

/* ─────────────────────────── Lazy Screens ─────────────────────────── */
const HomeScreen         = lazy(() => import('@/ui/screens/HomeScreen/HomeScreen'));
const MenuScreen         = lazy(() => import('@/ui/screens/MenuScreen/MenuScreen'));
const CartScreen         = lazy(() => import('@/ui/screens/CartScreen/CartScreen'));
const CheckoutScreen     = lazy(() => import('@/ui/screens/CheckoutScreen/CheckoutScreen'));
const PaymentScreen      = lazy(() => import('@/ui/screens/PaymentScreen/PaymentScreen'));
const PaymentSuccessScreen   = lazy(() => import('@/ui/screens/PaymentSuccessScreen/PaymentSuccessScreen'));
const PaymentFailedScreen    = lazy(() => import('@/ui/screens/PaymentFailedScreen/PaymentFailedScreen'));
const PaymentCancelledScreen = lazy(() => import('@/ui/screens/PaymentCancelledScreen/PaymentCancelledScreen'));
const LoginScreen        = lazy(() => import('@/ui/screens/LoginScreen/LoginScreen'));
const SignupScreen       = lazy(() => import('@/ui/screens/SignupScreen/SignupScreen'));
const OrdersScreen       = lazy(() => import('@/ui/screens/OrdersScreen/OrdersScreen'));
const AdminScreen        = lazy(() => import('@/ui/screens/AdminScreen/AdminScreen'));
const EmployeeScreen     = lazy(() => import('@/ui/screens/EmployeeScreen/EmployeeScreen'));
const OrderHistoryScreen = lazy(() => import('@/ui/screens/OrderHistoryScreen/OrderHistoryScreen'));
const NotFoundScreen     = lazy(() => import('@/ui/screens/NotFoundScreen/NotFoundScreen'));

/* ─────────────────────────── Loading Spinner ──────────────────────── */
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-soroco-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-soroco-linen border-t-soroco-amber animate-spin" />
        <p className="font-body text-soroco-mocha text-sm">Loading…</p>
      </div>
    </div>
  );
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
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
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
      </Suspense>
    </BrowserRouter>
  );
}
