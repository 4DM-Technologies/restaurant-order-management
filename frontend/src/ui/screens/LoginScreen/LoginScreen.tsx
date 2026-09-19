import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { useLoginVM } from '@/ui/screens/LoginScreen/LoginScreen.vm.ts';

export default function LoginScreen() {
  const { email, setEmail, password, setPassword, isLoading, error, handleLogin } = useLoginVM();

  return (
    <div className="min-h-screen flex">
      {/* Left — coffee image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80"
          alt="Coffee atmosphere"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-soroco-espresso/50" />
        {/* Brand text */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-soroco-cream">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-soroco-amber rounded-full flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold">Soroco House</span>
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight mb-4">
            Crafted with care,<br />served with love.
          </h2>
          <p className="font-body text-soroco-cream/70 text-lg leading-relaxed">
            Manage orders, monitor your kitchen, and keep your team in sync — all from one place.
          </p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex flex-col bg-soroco-cream">
        {/* Mobile back link */}
        <div className="p-6 lg:hidden">
          <Link to="/" className="inline-flex items-center gap-2 text-soroco-mocha hover:text-soroco-espresso transition-colors font-body text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            {/* Logo — desktop only */}
            <div className="hidden lg:flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-soroco-amber rounded-full flex items-center justify-center">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-2xl font-bold text-soroco-espresso">Soroco House</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-soroco-charcoal mb-2">
              Staff Login
            </h1>
            <p className="font-body text-soroco-mocha mb-8">
              Sign in to access your dashboard.
            </p>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 font-body text-sm"
              >
                <span className="mt-0.5">⚠</span>
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="email" className="input-label">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-soroco-tan pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@soroco.coffee"
                    className="input-field pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="input-label">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-soroco-tan pointer-events-none" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            {/* Hint text */}
            <div className="mt-6 p-4 bg-soroco-linen/60 rounded-xl border border-soroco-linen">
              <p className="font-body text-xs text-soroco-mocha leading-relaxed">
                <span className="font-semibold text-soroco-espresso">Admin:</span>{' '}
                admin@soroco.coffee / admin123
                <br />
                <span className="font-semibold text-soroco-espresso">Employee:</span>{' '}
                employee@soroco.coffee / employee123
              </p>
            </div>

            {/* Footer links */}
            <div className="mt-8 space-y-3 text-center">
              <p className="font-body text-sm text-soroco-mocha">
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold text-soroco-amber hover:text-soroco-sienna transition-colors">
                  Sign up
                </Link>
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-1 font-body text-sm text-soroco-mocha hover:text-soroco-espresso transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Menu
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
