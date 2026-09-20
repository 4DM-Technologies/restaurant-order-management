import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, ArrowLeft } from 'lucide-react';

export default function NotFoundScreen() {
  return (
    <div className="min-h-screen bg-soroco-cream flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3 mb-12"
      >
        <div className="w-10 h-10 bg-soroco-amber rounded-full flex items-center justify-center">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        <span className="font-display text-2xl font-bold text-soroco-espresso">Soroco House</span>
      </motion.div>

      {/* 404 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
        className="text-center mb-8"
      >
        <h1 className="font-display text-[8rem] sm:text-[12rem] font-bold text-soroco-linen leading-none select-none">
          404
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="text-center max-w-md"
      >
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-soroco-charcoal mb-3">
          Looks like this table is empty.
        </h2>
        <p className="font-body text-soroco-mocha text-base mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back to the menu.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/menu" className="btn-primary">
            <Coffee className="w-4 h-4" />
            Back to Menu
          </Link>
          <Link to="/" className="btn-ghost">
            <ArrowLeft className="w-4 h-4" />
            Go to Home
          </Link>
        </div>
      </motion.div>

      {/* Decorative bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="absolute bottom-8 left-0 right-0 flex justify-center"
      >
        <p className="font-body text-xs text-soroco-tan">
          © {new Date().getFullYear()} Soroco House. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
