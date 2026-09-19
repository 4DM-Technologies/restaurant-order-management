import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter, Coffee } from 'lucide-react';

// ── Real Soroco data from soroco.coffee ──────────────────────────────────────
const SOROCO_INFO = {
  address:  'Nungambakkam, Chennai, Tamil Nadu, India',
  phone:    '+91 98843 77632',
  phoneRaw: '+919884377632',
  email:    'enquiry@majofoods.in',
  website:  'https://www.soroco.coffee',
  instagram:'https://www.instagram.com/',
  hours: [
    { days: 'Monday – Friday', time: '5:00 AM – 9:00 PM' },
    { days: 'Saturday – Sunday', time: '7:00 AM – 10:00 PM' },
  ],
  about:
    'Founded in 2021, Soroco House is dedicated to crafting the finest specialty coffee experience in the heart of Tamil Nadu — using locally sourced beans that score 80+, meeting the highest standards of Specialty Coffee.',
  locations: [
    { name: 'SOROCO Nungambakkam', href: 'https://www.soroco.coffee/copy-of-soroco-anna-nagar' },
    { name: 'SOROCO OMR',          href: 'https://www.soroco.coffee/copy-of-soroco-nungambakkam' },
    { name: 'SOROCO Anna Nagar',   href: 'https://www.soroco.coffee/menus' },
  ],
};

const MENU_LINKS = [
  { label: 'Hot Luxury Teas', href: '/menu?category=hot-luxury-teas' },
  { label: 'Cold Brew',       href: '/menu?category=cold-brew' },
  { label: 'Filter Coffee',   href: '/menu?category=filter-coffee' },
  { label: 'Frappe',          href: '/menu?category=frappe' },
  { label: 'Non Coffee',      href: '/menu?category=non-coffee' },
  { label: 'Coffee Beans',    href: '/menu?category=coffee-beans' },
];

const QUICK_LINKS = [
  { label: 'Home',          href: '/' },
  { label: 'View Menu',     href: '/menu' },
  { label: 'My Cart',       href: '/cart' },
  { label: 'Sign In',       href: '/login' },
  { label: 'Order History', href: '/order-history' },
];

const SOCIAL = [
  { icon: Instagram, label: 'Instagram', href: SOROCO_INFO.instagram },
  { icon: Facebook,  label: 'Facebook',  href: '#' },
  { icon: Twitter,   label: 'Twitter',   href: '#' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-soroco-espresso text-soroco-parchment/80">

      {/* ── Brand strip ── */}
      <div className="border-b border-soroco-mocha/40">
        <div className="section-container py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-soroco-amber/20 flex items-center justify-center">
              <Coffee className="w-5 h-5 text-soroco-amber" />
            </div>
            <Link
              to="/"
              className="font-display font-bold text-soroco-cream text-2xl tracking-tight hover:opacity-80 transition-opacity"
            >
              Soroco House
            </Link>
          </div>
          <p className="font-body text-xs text-soroco-parchment/40 uppercase tracking-[0.2em]">
            Specialty Coffee · Chennai · Since 2021
          </p>
          <div className="flex items-center gap-2">
            {SOCIAL.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-soroco-mocha flex items-center justify-center text-soroco-parchment/50 hover:border-soroco-amber hover:text-soroco-amber transition-all duration-200"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="section-container py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="font-body font-semibold text-xs uppercase tracking-[0.15em] text-soroco-amber mb-4">
              About Us
            </h4>
            <p className="font-body text-sm leading-[1.8] text-soroco-parchment/65 mb-5">
              {SOROCO_INFO.about}
            </p>
            <a
              href={SOROCO_INFO.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-soroco-amber hover:underline font-body"
            >
              soroco.coffee ↗
            </a>
          </div>

          {/* Menu links */}
          <div>
            <h4 className="font-body font-semibold text-xs uppercase tracking-[0.15em] text-soroco-amber mb-4">
              Our Menu
            </h4>
            <ul className="space-y-2.5">
              {MENU_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="font-body text-sm text-soroco-parchment/65 hover:text-soroco-cream transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-body font-semibold text-xs uppercase tracking-[0.15em] text-soroco-amber mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="font-body text-sm text-soroco-parchment/65 hover:text-soroco-cream transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Locations */}
            <h4 className="font-body font-semibold text-xs uppercase tracking-[0.15em] text-soroco-amber mb-3 mt-7">
              Locations
            </h4>
            <ul className="space-y-2.5">
              {SOROCO_INFO.locations.map(({ name, href }) => (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-sm text-soroco-parchment/65 hover:text-soroco-cream transition-colors duration-150"
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h4 className="font-body font-semibold text-xs uppercase tracking-[0.15em] text-soroco-amber mb-4">
              Find Us
            </h4>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-soroco-tan" />
                <span className="font-body text-sm text-soroco-parchment/65 leading-relaxed">
                  {SOROCO_INFO.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 shrink-0 text-soroco-tan" />
                <a
                  href={`tel:${SOROCO_INFO.phoneRaw}`}
                  className="font-body text-sm text-soroco-parchment/65 hover:text-soroco-cream transition-colors"
                >
                  {SOROCO_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 shrink-0 text-soroco-tan" />
                <a
                  href={`mailto:${SOROCO_INFO.email}`}
                  className="font-body text-sm text-soroco-parchment/65 hover:text-soroco-cream transition-colors"
                >
                  {SOROCO_INFO.email}
                </a>
              </li>
            </ul>

            {/* Hours box */}
            <div className="rounded-xl border border-soroco-mocha/60 px-4 py-4 bg-soroco-charcoal/30">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-soroco-amber" />
                <p className="font-body text-xs text-soroco-amber font-semibold uppercase tracking-widest">
                  Hours
                </p>
              </div>
              {SOROCO_INFO.hours.map(({ days, time }) => (
                <div key={days} className="mb-1.5 last:mb-0">
                  <p className="font-body text-xs text-soroco-tan">{days}</p>
                  <p className="font-body text-sm text-soroco-parchment/75 font-medium">{time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom strip ── */}
      <div className="border-t border-soroco-mocha/40">
        <div className="section-container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-soroco-parchment/35 font-body">
          <p>© {year} Soroco House · Majo Foods Pvt. Ltd. · All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-soroco-parchment/60 transition-colors">Privacy Policy</a>
            <span aria-hidden>·</span>
            <a href="#" className="hover:text-soroco-parchment/60 transition-colors">Terms</a>
            <span aria-hidden>·</span>
            <a
              href={SOROCO_INFO.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-soroco-parchment/60 transition-colors"
            >
              soroco.coffee
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
