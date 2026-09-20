import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  Coffee,
  Leaf,
  MapPin,
  Star,
  Clock,
  Award,
  Sparkles,
} from 'lucide-react';
import Navbar from '@/ui/reusables/Navbar/Navbar.tsx';
import Footer from '@/ui/reusables/Footer/Footer.tsx';
import FoodCard from '@/ui/reusables/FoodCard/FoodCard.tsx';
import Reveal from '@/ui/reusables/Reveal/Reveal.tsx';
import { menuScreenService } from '@/services/screens/menuScreenService/MenuScreenService.ts';
import {
  MENU_CATEGORIES,
  IMAGES,
  CATEGORY_TILE_IMAGES,
} from '@/services/screens/menuScreenService/menuData.ts';
import type { MenuItemBO } from '@/types/menu/MenuItemBO.ts';

// ─── HERO ───────────────────────────────────────────────────────────────────
function HeroSection() {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.16, delayChildren: 0.3 } },
  };
  const itemVariants = {
    hidden:   { opacity: 0, y: 40 },
    visible:  { opacity: 1, y: 0, transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background image with Ken Burns effect */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: 'easeOut' }}
      >
        <img
          src={IMAGES.HERO_BG}
          alt="Soroco House café interior"
          className={`w-full h-full object-cover transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          fetchPriority="high"
        />
        {/* Dual gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-soroco-charcoal/70 via-soroco-charcoal/40 to-soroco-charcoal/80" />
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(26,15,10,0.5)_100%)]" />
      </motion.div>

      {/* Navbar sits on top of hero — transparent */}
      <Navbar variant="dark" />

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-24 pb-20">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-soroco-amber/60" />
            <span className="eyebrow text-soroco-amber/90 tracking-[0.2em]">
              PREMIUM COFFEE &amp; TEAS
            </span>
            <div className="h-px w-12 bg-soroco-amber/60" />
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.08] mb-4 tracking-tight"
          >
            Soroco{' '}
            <motion.span
              className="italic text-soroco-amber font-medium"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              House
            </motion.span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={itemVariants}
            className="font-display italic text-xl sm:text-2xl text-white/75 mb-10 tracking-wide"
          >
            Where Every Sip Tells a Story
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/menu')}
              className="group inline-flex items-center gap-3 bg-soroco-amber text-white font-body font-semibold px-8 py-4 rounded-full text-base shadow-warm-lg hover:bg-soroco-sienna transition-all duration-300"
            >
              Order Now
              <motion.span
                className="group-hover:translate-x-1 transition-transform duration-200"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/menu')}
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white font-body font-semibold px-8 py-4 rounded-full text-base border border-white/30 hover:bg-white/20 transition-all duration-300"
            >
              Explore Menu
            </motion.button>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            variants={itemVariants}
            className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10"
          >
            {[
              { icon: <Coffee className="w-4 h-4" />, text: 'Specialty Roasts' },
              { icon: <Leaf className="w-4 h-4" />, text: 'Luxury Teas' },
              { icon: <Award className="w-4 h-4" />, text: 'Sourced Ethically' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-white/60 text-sm font-body">
                <span className="text-soroco-amber">{icon}</span>
                {text}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.button
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          aria-label="Scroll down"
        >
          <span className="text-xs font-body tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </motion.button>
      </div>
    </section>
  );
}

// ─── STORY ──────────────────────────────────────────────────────────────────
function StorySection() {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <section className="section-padding bg-soroco-cream overflow-hidden">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text */}
          <div>
            <Reveal>
              <span className="eyebrow">OUR STORY</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="heading-lg mt-3 mb-6">
                The Soroco{' '}
                <span className="italic text-soroco-amber font-medium">Story</span>
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="body-md mb-5 leading-[1.8]">
                Soroco was born from a simple belief — that coffee and tea are not just
                beverages, they are rituals. Our name blends <em>South</em> and <em>Roco</em>,
                a nod to both South Indian filter traditions and the rocky highlands where our
                finest beans are grown.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="body-md mb-8 leading-[1.8]">
                Every cup at Soroco House is the result of weeks of curation — sourcing
                single-origin lots, developing house roast profiles, and crafting drinks
                that feel both timeless and new. We believe in transparency, craftsmanship,
                and the quiet joy of a perfectly made brew.
              </p>
            </Reveal>

            {/* Stats */}
            <Reveal delay={0.25}>
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-soroco-linen">
                {[
                  { value: '12+', label: 'Origins' },
                  { value: '40+', label: 'Blends' },
                  { value: '6',   label: 'Years' },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <p className="font-display font-bold text-3xl text-soroco-espresso">{value}</p>
                    <p className="font-body text-sm text-soroco-tan mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Image */}
          <Reveal delay={0.1} x={40} y={0}>
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-warm-xl bg-soroco-linen">
                <img
                  src={IMAGES.STORY_BG}
                  alt="Inside Soroco House"
                  loading="lazy"
                  onLoad={() => setImgLoaded(true)}
                  className={`w-full h-full object-cover transition-opacity duration-700 ${
                    imgLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.5, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute -bottom-5 -left-5 sm:-bottom-6 sm:-left-6 bg-soroco-espresso text-soroco-cream px-5 py-4 rounded-2xl shadow-warm-lg"
              >
                <p className="font-display font-bold text-3xl">16h</p>
                <p className="font-body text-xs text-soroco-tan mt-0.5">Cold Brew Steep</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.65, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute -top-4 -right-4 sm:-top-5 sm:-right-5 bg-soroco-amber text-white px-5 py-4 rounded-2xl shadow-warm-lg"
              >
                <p className="font-display font-bold text-2xl">Since</p>
                <p className="font-display font-bold text-3xl leading-none">'18</p>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── FEATURED ────────────────────────────────────────────────────────────────
function FeaturedSection() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MenuItemBO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    menuScreenService
      .getFeaturedItems()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section-padding bg-soroco-parchment">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-12">
          <Reveal>
            <span className="eyebrow">MENU HIGHLIGHTS</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="heading-lg mt-3">
              Crafted With{' '}
              <span className="italic text-soroco-amber font-medium">Intention</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="body-md mt-4 max-w-xl mx-auto">
              A curated selection from our full menu — our most loved and most
              distinctive creations.
            </p>
          </Reveal>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="aspect-[4/3] skeleton" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 }}
              >
                <FoodCard
                  item={item}
                  onAddToCart={() => {}}
                  onViewDetail={() => navigate('/menu')}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <Reveal delay={0.2} className="text-center mt-12">
          <Link to="/menu" className="btn-secondary inline-flex items-center gap-2 group">
            View Full Menu
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
function CategoriesSection() {
  const navigate = useNavigate();

  return (
    <section className="section-padding bg-soroco-cream">
      <div className="section-container">
        <div className="text-center mb-12">
          <Reveal>
            <span className="eyebrow">WHAT WE SERVE</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="heading-lg mt-3">
              Explore Our{' '}
              <span className="italic text-soroco-amber font-medium">Menu</span>
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
          {MENU_CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.id}
              onClick={() => navigate(`/menu?category=${cat.id}`)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="group relative aspect-[4/3] sm:aspect-[3/2] rounded-2xl overflow-hidden shadow-warm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soroco-amber focus-visible:ring-offset-2"
              aria-label={`Browse ${cat.label}`}
            >
              {/* Background image */}
              <img
                src={CATEGORY_TILE_IMAGES[cat.id]}
                alt={cat.label}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-soroco-charcoal/80 via-soroco-charcoal/30 to-transparent" />
              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-start justify-end p-4 sm:p-5">
                <p className="font-display font-bold text-white text-sm sm:text-base md:text-lg leading-snug">
                  {cat.label}
                </p>
                <div className="mt-1 flex items-center gap-1 text-soroco-amber opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs font-body font-semibold">Explore</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── ATMOSPHERE ──────────────────────────────────────────────────────────────
function AtmosphereSection() {
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});

  return (
    <section className="section-padding bg-soroco-espresso overflow-hidden">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image mosaic */}
          <Reveal x={-40} y={0}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Tall left image */}
              <div className="row-span-2 rounded-2xl overflow-hidden aspect-[2/3] bg-soroco-mocha shadow-warm-lg">
                <img
                  src={IMAGES.ATMO_1}
                  alt="Soroco House atmosphere"
                  loading="lazy"
                  onLoad={() => setLoaded((p) => ({ ...p, 0: true }))}
                  className={`w-full h-full object-cover transition-all duration-700 hover:scale-105 ${
                    loaded[0] ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
              {/* Top right */}
              <div className="rounded-2xl overflow-hidden aspect-square bg-soroco-mocha shadow-warm-lg">
                <img
                  src={IMAGES.ATMO_2}
                  alt="Specialty coffee preparation"
                  loading="lazy"
                  onLoad={() => setLoaded((p) => ({ ...p, 1: true }))}
                  className={`w-full h-full object-cover transition-all duration-700 hover:scale-105 ${
                    loaded[1] ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
              {/* Bottom right */}
              <div className="rounded-2xl overflow-hidden aspect-square bg-soroco-mocha shadow-warm-lg">
                <img
                  src={IMAGES.ATMO_3}
                  alt="Soroco House interior"
                  loading="lazy"
                  onLoad={() => setLoaded((p) => ({ ...p, 2: true }))}
                  className={`w-full h-full object-cover transition-all duration-700 hover:scale-105 ${
                    loaded[2] ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
            </div>
          </Reveal>

          {/* Text */}
          <div className="text-soroco-cream">
            <Reveal delay={0.1}>
              <span className="eyebrow text-soroco-amber/90">THE SPACE</span>
            </Reveal>
            <Reveal delay={0.15}>
              <h2 className="heading-lg text-soroco-cream mt-3 mb-6">
                Come As{' '}
                <span className="italic text-soroco-amber font-medium">You Are</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="body-md text-soroco-parchment/75 leading-[1.8] mb-6">
                Soroco House is a place to slow down. Whether you're here to work,
                to think, to catch up with a friend, or just to sit quietly with a cup
                that was made for you — you'll find your corner here.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="body-md text-soroco-parchment/75 leading-[1.8] mb-8">
                Warm wood surfaces, natural light, the hiss of an espresso machine,
                and the faint fragrance of blooming teas. This is your pause.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="flex items-start gap-3 text-soroco-parchment/60 text-sm font-body">
                <MapPin className="w-5 h-5 text-soroco-amber mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-soroco-cream">Soroco House</p>
                  <p>12 Brew Street, Koramangala</p>
                  <p>Bengaluru — 560 034</p>
                  <p className="mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-soroco-amber" />
                    <span>7:30 AM – 10:30 PM, Daily</span>
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── ORDER CTA ────────────────────────────────────────────────────────────────
function OrderCTASection() {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-soroco-charcoal">
      {/* Decorative rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] border border-white/5 rounded-full" />
        <div className="absolute w-[400px] h-[400px] border border-white/5 rounded-full" />
        <div className="absolute w-[200px] h-[200px] border border-white/8 rounded-full" />
      </div>

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-soroco-amber/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 section-container text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-soroco-amber/15 border border-soroco-amber/30 mb-8">
            <Sparkles className="w-4 h-4 text-soroco-amber" />
            <span className="text-soroco-amber text-sm font-semibold font-body tracking-wide">
              Scan. Order. Enjoy.
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="heading-xl text-white mb-6">
            Ready to{' '}
            <span className="italic text-soroco-amber font-medium">Order?</span>
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="body-lg text-white/60 max-w-xl mx-auto mb-10">
            Scan the QR code on your table, browse the full menu, and order exactly
            what you want — straight from your phone.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/menu')}
              className="group inline-flex items-center gap-3 bg-soroco-amber text-white font-body font-semibold px-10 py-4 rounded-full text-lg shadow-warm-xl hover:bg-soroco-sienna transition-all duration-300"
            >
              Order Now
              <motion.span className="group-hover:translate-x-1 transition-transform duration-200">
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/menu')}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white font-body font-medium text-base transition-colors duration-200"
            >
              <Star className="w-4 h-4 text-soroco-amber" />
              See what's popular
            </motion.button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── TICKER (marquee strip) ───────────────────────────────────────────────────
const TICKER_ITEMS = [
  'Specialty Coffee',
  'Luxury Teas',
  'Cold Brew',
  'Pour Over',
  'Frappes',
  'Non-Coffee',
  'Seasonal Specials',
  'Single Origins',
];

function TickerSection() {
  return (
    <div className="relative overflow-hidden bg-soroco-amber py-3.5 flex">
      <motion.div
        className="flex gap-12 whitespace-nowrap shrink-0"
        animate={{ x: [0, '-50%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="flex items-center gap-5 font-body font-semibold text-white text-sm tracking-widest uppercase">
            {item}
            <span className="w-1.5 h-1.5 rounded-full bg-white/50 shrink-0" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  return (
    <main>
      <HeroSection />
      <TickerSection />
      <StorySection />
      <FeaturedSection />
      <CategoriesSection />
      <AtmosphereSection />
      <OrderCTASection />
      <Footer />
    </main>
  );
}
