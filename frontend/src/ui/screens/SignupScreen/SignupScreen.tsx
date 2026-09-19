import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, Mail, Lock, User, Loader2, ArrowLeft } from 'lucide-react';
import { useSignupVM } from '@/ui/screens/SignupScreen/SignupScreen.vm.ts';
import type { PasswordStrength } from '@/ui/screens/SignupScreen/SignupScreen.vm.ts';

const STRENGTH_CONFIG: Record<PasswordStrength, { label: string; color: string; width: string }> = {
  weak:   { label: 'Weak',   color: 'bg-red-500',    width: 'w-1/3' },
  medium: { label: 'Medium', color: 'bg-amber-500',  width: 'w-2/3' },
  strong: { label: 'Strong', color: 'bg-green-500',  width: 'w-full' },
};

export default function SignupScreen() {
  const {
    name, setName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    passwordStrength,
    isLoading, error,
    handleSignup,
  } = useSignupVM();

  const strengthConfig = STRENGTH_CONFIG[passwordStrength];

  return (
    <div className="min-h-screen flex">
      {/* Left — coffee image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80"
          alt="Coffee atmosphere"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-soroco-espresso/50" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-soroco-cream">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-soroco-amber rounded-full flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold">Soroco House</span>
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight mb-4">
            Join our team<br />of coffee lovers.
          </h2>
          <p className="font-body text-soroco-cream/70 text-lg leading-relaxed">
            Create your account to start managing orders and delighting customers.
          </p>
        </div>
      </div>

      {/* Right — signup form */}
      <div className="flex-1 flex flex-col bg-soroco-cream">
        {/* Mobile back link */}
        <div className="p-6 lg:hidden">
          <Link to="/" className="inline-flex items-center gap-2 text-soroco-mocha hover:text-soroco-espresso transition-colors font-body text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-12">
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
              Create Account
            </h1>
            <p className="font-body text-soroco-mocha mb-8">
              Fill in your details to get started.
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

            <form onSubmit={handleSignup} className="space-y-4" noValidate>
              {/* Name */}
              <div>
                <label htmlFor="name" className="input-label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-soroco-tan pointer-events-none" />
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="input-field pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="input-label">Email Address</label>
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
                <label htmlFor="password" className="input-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-soroco-tan pointer-events-none" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="input-field pl-10"
                    disabled={isLoading}
                  />
                </div>
                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-soroco-linen rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${strengthConfig.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          key={strengthConfig.width}
                          transition={{ duration: 0.3 }}
                          style={{ maxWidth: strengthConfig.width === 'w-1/3' ? '33%' : strengthConfig.width === 'w-2/3' ? '66%' : '100%' }}
                        />
                      </div>
                      <span className={`font-body text-xs font-medium ${
                        passwordStrength === 'weak' ? 'text-red-500' :
                        passwordStrength === 'medium' ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {strengthConfig.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-soroco-tan pointer-events-none" />
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className={`input-field pl-10 ${
                      confirmPassword.length > 0 && confirmPassword !== password
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                        : ''
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {confirmPassword.length > 0 && confirmPassword !== password && (
                  <p className="mt-1 font-body text-xs text-red-500">Passwords don't match</p>
                )}
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
                    Creating account…
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Footer links */}
            <div className="mt-8 space-y-3 text-center">
              <p className="font-body text-sm text-soroco-mocha">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-soroco-amber hover:text-soroco-sienna transition-colors">
                  Login
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
