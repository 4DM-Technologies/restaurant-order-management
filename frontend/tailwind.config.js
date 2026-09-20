/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soroco Brand Colors
        soroco: {
          cream:     '#FAF7F2',   // base background
          parchment: '#F2EDE3',   // card background
          linen:     '#E8DFD0',   // borders / dividers
          tan:       '#C8A882',   // warm mid-tone
          amber:     '#C8956C',   // accent / CTA
          sienna:    '#A0653A',   // amber dark
          mocha:     '#6B3F2A',   // mid brown
          espresso:  '#3D1F10',   // deep brown
          charcoal:  '#1A0F0A',   // near-black text
        },
        // Status Colors
        status: {
          queue:     '#E8A838',
          preparing: '#4A9EE8',
          prepared:  '#38A85C',
          delivered: '#8B8B8B',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'warm-sm': '0 1px 3px 0 rgba(61,31,16,0.08)',
        'warm':    '0 4px 12px 0 rgba(61,31,16,0.10)',
        'warm-md': '0 8px 24px 0 rgba(61,31,16,0.12)',
        'warm-lg': '0 20px 48px 0 rgba(61,31,16,0.16)',
        'warm-xl': '0 32px 64px 0 rgba(61,31,16,0.20)',
      },
      backgroundImage: {
        'gradient-warm':  'linear-gradient(135deg, #FAF7F2 0%, #F2EDE3 100%)',
        'gradient-amber': 'linear-gradient(135deg, #C8956C 0%, #A0653A 100%)',
        'gradient-espresso': 'linear-gradient(180deg, #3D1F10 0%, #1A0F0A 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in':       'fadeIn 0.4s ease-out forwards',
        'fade-up':       'fadeUp 0.5s ease-out forwards',
        'slide-up':      'slideUp 0.4s cubic-bezier(0.32,0.72,0,1) forwards',
        'slide-down':    'slideDown 0.3s cubic-bezier(0.32,0.72,0,1) forwards',
        'scale-in':      'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'cart-bounce':   'cartBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'shimmer':       'shimmer 1.6s ease-in-out infinite',
        'pulse-soft':    'pulseSoft 2s ease-in-out infinite',
        'spin-slow':     'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp:    { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp:   { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        slideDown: { from: { transform: 'translateY(-100%)' }, to: { transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.92)' }, to: { opacity: '1', transform: 'scale(1)' } },
        cartBounce:{ '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.25)' }, '70%': { transform: 'scale(0.92)' }, '100%': { transform: 'scale(1)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
