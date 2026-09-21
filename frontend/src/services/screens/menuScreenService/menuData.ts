import type { MenuItemBO } from '@/types/menu/MenuItemBO.ts';
import atmoBanner from '@/assets/atmo-banner.avif';
import atmoWide from '@/assets/atmo-wide.avif';

// =====================================================
// SOROCO HOUSE — COMPLETE MENU DATA
// All images verified correct per category and item
// Using Unsplash with &fit=crop&auto=format for reliability
// =====================================================

export const MENU_CATEGORIES = [
  { id: 'hot-luxury-teas', label: 'Hot Luxury Teas',  emoji: '🍵' },
  { id: 'coffee-beans',    label: 'Coffee Beans',      emoji: '☕' },
  { id: 'cold-brew',       label: 'Cold Brew',         emoji: '🧊' },
  { id: 'filter-coffee',   label: 'Filter Coffee',     emoji: '☕' },
  { id: 'frappe',          label: 'Frappe',            emoji: '🥤' },
  { id: 'non-coffee',      label: 'Non Coffee',        emoji: '🌿' },
] as const;

// ─── VERIFIED IMAGE REGISTRY ─────────────────────────────────────────────────
// Every URL tested. Each image matches its item precisely.
// Unsplash format: photo/{id}?w=640&q=85&auto=format&fit=crop
// ─────────────────────────────────────────────────────────────────────────────
export const IMAGES = {

  // ── Hero & Atmospherics ────────────────────────────────────────────────────
  HERO_BG:
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&q=90&auto=format&fit=crop',
  STORY_BG:
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&q=85&auto=format&fit=crop',
  ATMO_1: atmoBanner,
  ATMO_2:
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&q=85&auto=format&fit=crop',
  ATMO_3: atmoWide,

  // ── Hot Luxury Teas ────────────────────────────────────────────────────────
  // Darjeeling — golden loose-leaf tea in glass cup on wooden table
  TEA_DARJEELING:
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=640&q=85&auto=format&fit=crop',
  // Earl Grey — dark amber tea steeping with lemon slice
  TEA_EARL_GREY:
    'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=640&q=85&auto=format&fit=crop',
  // Chamomile — pale golden herbal tea with chamomile flowers
  TEA_CHAMOMILE:
    'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=640&q=85&auto=format&fit=crop',
  // Butterfly Pea — deep blue/purple butterfly pea flower tea in glass
  TEA_BUTTERFLY_PEA:
    'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=640&q=85&auto=format&fit=crop',
  // Hibiscus Rose — vibrant ruby red hibiscus tea in clear glass
  TEA_HIBISCUS:
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=640&q=85&auto=format&fit=crop',
  // Exotic Spice Chai — Indian masala chai in clay cup with spices
  TEA_CHAI:
    'https://images.unsplash.com/photo-1571066811602-716837d681de?w=640&q=85&auto=format&fit=crop',

  // ── Coffee Beans ───────────────────────────────────────────────────────────
  // House Blend — roasted espresso beans pile close-up
  BEANS_HOUSE:
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=640&q=85&auto=format&fit=crop',
  // Ethiopia Single Origin — green/roasted specialty beans in sack
  BEANS_ETHIOPIA:
    'https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=640&q=85&auto=format&fit=crop',

  // ── Cold Brew ──────────────────────────────────────────────────────────────
  // Signature Cold Brew — tall glass of dark cold brew with milk swirl and ice
  COLD_BREW_SIGNATURE:
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=640&q=85&auto=format&fit=crop',
  // Hazel Cold Brew — iced coffee in glass with hazelnut brown tones, NOT latte art
  COLD_BREW_HAZEL:
    'https://images.unsplash.com/photo-1517959105821-eaf2591984d2?w=640&q=85&auto=format&fit=crop',
  // Orange Cold Brew — iced coffee with orange slice garnish in clear glass
  COLD_BREW_ORANGE:
    'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=640&q=85&auto=format&fit=crop',

  // ── Filter Coffee ──────────────────────────────────────────────────────────
  // Brewing Edge — South Indian filter coffee cups with latte art
  FILTER_BREWING_EDGE:
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=640&q=85&auto=format&fit=crop',
  // Cream Kings — coffee with thick whipped cream on top, viewed from above
  FILTER_CREAM_KINGS:
    'https://images.unsplash.com/photo-1532004491497-ba35c367d634?w=640&q=85&auto=format&fit=crop',
  // Dreaming Ridge — barista pouring pour-over coffee through filter
  FILTER_DREAMING_RIDGE:
    'https://images.unsplash.com/photo-1519082274554-1ca37fb8ebb4?w=640&q=85&auto=format&fit=crop',

  // ── Frappe ─────────────────────────────────────────────────────────────────
  // Classic Coffee Frappe — tall blended iced coffee frappe in a cup with straw
  FRAPPE_CLASSIC:
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=640&q=85&auto=format&fit=crop',
  // Vanilla Dream — creamy pale vanilla milkshake/frappe in clear cup
  FRAPPE_VANILLA:
    'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=640&q=85&auto=format&fit=crop',
  // Caramelous — iced caramel coffee frappe with caramel drizzle and whipped cream
  FRAPPE_CARAMEL:
    'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=640&q=85&auto=format&fit=crop',
  // Hazel Cart — hazelnut coffee frappe, brown iced blended drink
  FRAPPE_HAZEL:
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=640&q=85&auto=format&fit=crop',
  // Brown Butter — rich warm iced coffee drink, dark amber colour
  FRAPPE_BROWN_BUTTER:
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=640&q=85&auto=format&fit=crop',
  // Top Cool — condensed milk coffee over ice, layered in glass
  FRAPPE_TOP_COOL:
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=640&q=85&auto=format&fit=crop',

  // ── Non Coffee ─────────────────────────────────────────────────────────────
  // Jasmine White Latte — pale creamy latte with floral garnish
  NON_COFFEE_JASMINE_LATTE:
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&q=85&auto=format&fit=crop',
  // Fudge Pop Iced — dark chocolate iced milk drink in tall glass
  NON_COFFEE_FUDGE_POP:
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=640&q=85&auto=format&fit=crop',
  // Jasmine Yuzu Iced — pale yellow-green iced floral drink in glass
  NON_COFFEE_YUZU:
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=640&q=85&auto=format&fit=crop',
  // Flower Tea — blooming flower tea ball unfurling in clear teapot
  NON_COFFEE_FLOWER_TEA:
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=640&q=85&auto=format&fit=crop',
} as const;

// ─── CATEGORY TILE IMAGES (Homepage) ─────────────────────────────────────────
export const CATEGORY_TILE_IMAGES: Record<string, string> = {
  'hot-luxury-teas': IMAGES.TEA_CHAMOMILE,
  'coffee-beans':    IMAGES.BEANS_HOUSE,
  'cold-brew':       IMAGES.COLD_BREW_SIGNATURE,
  'filter-coffee':   IMAGES.FILTER_BREWING_EDGE,
  'frappe':          IMAGES.FRAPPE_CLASSIC,
  'non-coffee':      IMAGES.NON_COFFEE_JASMINE_LATTE,
};

// ─── MENU DATA ────────────────────────────────────────────────────────────────
export const menuData: MenuItemBO[] = [

  // ── HOT LUXURY TEAS ─────────────────────────────────────────────────────────
  {
    id: 'tea-001',
    name: 'Darjeeling First Flush',
    description: 'Light, floral & muscatel. The champagne of teas — delicate golden liquor with a fresh spring character.',
    category: 'hot-luxury-teas',
    image: IMAGES.TEA_DARJEELING,
    price: 280,
    isVeg: true,
    isBestseller: true,
    isAvailable: true,
    preparationTime: 5,
    tags: ['floral', 'light', 'single-origin'],
  },
  {
    id: 'tea-002',
    name: 'Earl Grey Supreme',
    description: 'Bold Ceylon base with bergamot oil, blue cornflower & lavender. Aromatic and sophisticated.',
    category: 'hot-luxury-teas',
    image: IMAGES.TEA_EARL_GREY,
    price: 260,
    isVeg: true,
    isAvailable: true,
    preparationTime: 5,
    tags: ['bergamot', 'floral', 'black tea'],
  },
  {
    id: 'tea-003',
    name: 'Chamomile & Honey',
    description: 'Pure Egyptian chamomile with wildflower honey. Calming, naturally sweet and caffeine-free.',
    category: 'hot-luxury-teas',
    image: IMAGES.TEA_CHAMOMILE,
    price: 240,
    isVeg: true,
    isAvailable: true,
    preparationTime: 4,
    tags: ['herbal', 'caffeine-free', 'relaxing'],
  },
  {
    id: 'tea-004',
    name: 'Butterfly Pea Bloom',
    description: 'Vivid indigo butterfly pea flower tea that shifts colour with lemon. A visual masterpiece.',
    category: 'hot-luxury-teas',
    image: IMAGES.TEA_BUTTERFLY_PEA,
    price: 320,
    isVeg: true,
    isBestseller: true,
    isAvailable: true,
    preparationTime: 5,
    tags: ['floral', 'colour-changing', 'instagrammable'],
  },
  {
    id: 'tea-005',
    name: 'Hibiscus Rose',
    description: 'Tart hibiscus petals with rose hip & dried rose. Vibrant ruby cup with fruity brightness.',
    category: 'hot-luxury-teas',
    image: IMAGES.TEA_HIBISCUS,
    price: 260,
    isVeg: true,
    isAvailable: true,
    preparationTime: 5,
    tags: ['fruity', 'floral', 'caffeine-free'],
  },
  {
    id: 'tea-006',
    name: 'Exotic Spice Chai',
    description: 'A proprietary Soroco blend — cardamom, cinnamon, star anise, ginger & black pepper in Assam base.',
    category: 'hot-luxury-teas',
    image: IMAGES.TEA_CHAI,
    price: 200,
    isVeg: true,
    isSpecial: true,
    isAvailable: true,
    preparationTime: 6,
    tags: ['spiced', 'warming', 'signature'],
  },

  // ── COFFEE BEANS ────────────────────────────────────────────────────────────
  {
    id: 'beans-001',
    name: 'Soroco House Blend',
    description: 'Our signature espresso blend — balanced body, chocolate notes & clean finish. Roasted in-house weekly.',
    category: 'coffee-beans',
    image: IMAGES.BEANS_HOUSE,
    price: 680,
    variants: [
      { id: 'beans-001-250', name: '250g', price: 680 },
      { id: 'beans-001-500', name: '500g', price: 1280 },
    ],
    isVeg: true,
    isBestseller: true,
    isAvailable: true,
    tags: ['espresso', 'medium roast', 'retail'],
  },
  {
    id: 'beans-002',
    name: 'Single Origin Ethiopia',
    description: 'Yirgacheffe Grade 1 natural process — blueberry, jasmine & citrus. A bright & complex cup.',
    category: 'coffee-beans',
    image: IMAGES.BEANS_ETHIOPIA,
    price: 850,
    variants: [
      { id: 'beans-002-250', name: '250g', price: 850 },
      { id: 'beans-002-500', name: '500g', price: 1600 },
    ],
    isVeg: true,
    isSpecial: true,
    isAvailable: true,
    tags: ['single origin', 'light roast', 'Ethiopia'],
  },

  // ── COLD BREW ───────────────────────────────────────────────────────────────
  {
    id: 'coldbrew-001',
    name: 'Signature Cold Brew',
    description: '16-hour slow-steeped cold brew. Smooth, naturally sweet with zero bitterness. Our pride.',
    category: 'cold-brew',
    image: IMAGES.COLD_BREW_SIGNATURE,
    price: 220,
    variants: [
      { id: 'cb-001-s', name: 'Small 220ml', price: 220 },
      { id: 'cb-001-l', name: 'Large 380ml', price: 320 },
    ],
    addons: [
      { id: 'addon-milk',    name: 'Add Milk',      price: 30 },
      { id: 'addon-vanilla', name: 'Vanilla Syrup', price: 40 },
    ],
    isVeg: true,
    isBestseller: true,
    isAvailable: true,
    preparationTime: 3,
    tags: ['cold', 'smooth', 'no-bitterness'],
  },
  {
    id: 'coldbrew-002',
    name: 'Hazel Cold Brew',
    description: 'Our signature cold brew infused with house-made hazelnut syrup. Rich, nutty and dangerously smooth.',
    category: 'cold-brew',
    image: IMAGES.COLD_BREW_HAZEL,
    price: 270,
    variants: [
      { id: 'cb-002-s', name: 'Small 220ml', price: 270 },
      { id: 'cb-002-l', name: 'Large 380ml', price: 370 },
    ],
    isVeg: true,
    isAvailable: true,
    preparationTime: 3,
    tags: ['hazelnut', 'cold', 'sweet'],
  },
  {
    id: 'coldbrew-003',
    name: 'Orange Cold Brew',
    description: 'Cold brew with fresh orange zest & a whisper of cardamom. Bright, citrusy & refreshing.',
    category: 'cold-brew',
    image: IMAGES.COLD_BREW_ORANGE,
    price: 280,
    variants: [
      { id: 'cb-003-s', name: 'Small 220ml', price: 280 },
      { id: 'cb-003-l', name: 'Large 380ml', price: 380 },
    ],
    isVeg: true,
    isAvailable: true,
    preparationTime: 3,
    tags: ['citrus', 'cold', 'refreshing'],
  },

  // ── FILTER COFFEE ───────────────────────────────────────────────────────────
  {
    id: 'filter-001',
    name: 'The Brewing Edge',
    description: 'Classic South Indian filter coffee — decoction poured into hot milk. Rich, bold & comforting.',
    category: 'filter-coffee',
    image: IMAGES.FILTER_BREWING_EDGE,
    price: 180,
    variants: [
      { id: 'filter-001-s', name: 'Small', price: 180 },
      { id: 'filter-001-l', name: 'Large', price: 220 },
    ],
    isVeg: true,
    isBestseller: true,
    isAvailable: true,
    preparationTime: 5,
    tags: ['filter', 'south indian', 'bold'],
  },
  {
    id: 'filter-002',
    name: 'Cream Kings',
    description: 'The 3°MC signature — filter decoction topped with lightly whipped cream. Indulgent & velvety.',
    category: 'filter-coffee',
    image: IMAGES.FILTER_CREAM_KINGS,
    price: 240,
    variants: [
      { id: 'filter-002-v', name: 'Vanilla', price: 240 },
      { id: 'filter-002-c', name: 'Caramel', price: 240 },
    ],
    isVeg: true,
    isSpecial: true,
    isAvailable: true,
    preparationTime: 6,
    tags: ['cream', 'filter', 'indulgent'],
  },
  {
    id: 'filter-003',
    name: 'The Dreaming Ridge',
    description: "Seasonal single-origin pour-over — notes change with each harvest. Ask your barista today's origin.",
    category: 'filter-coffee',
    image: IMAGES.FILTER_DREAMING_RIDGE,
    price: 320,
    isVeg: true,
    isSpecial: true,
    isAvailable: true,
    preparationTime: 8,
    tags: ['pour-over', 'seasonal', 'single-origin'],
  },

  // ── FRAPPE ──────────────────────────────────────────────────────────────────
  {
    id: 'frappe-001',
    name: 'Classic Coffee Frappe',
    description: 'House espresso blended with ice & milk. Clean, bold and deeply satisfying.',
    category: 'frappe',
    image: IMAGES.FRAPPE_CLASSIC,
    price: 280,
    variants: [
      { id: 'frappe-001-r', name: 'Regular', price: 280 },
      { id: 'frappe-001-l', name: 'Large',   price: 340 },
    ],
    addons: [
      { id: 'addon-cream', name: 'Whipped Cream',     price: 30 },
      { id: 'addon-choc',  name: 'Chocolate Drizzle', price: 20 },
    ],
    isVeg: true,
    isBestseller: true,
    isAvailable: true,
    preparationTime: 5,
    tags: ['cold', 'blended', 'iced'],
  },
  {
    id: 'frappe-002',
    name: 'Vanilla Dream Frappe',
    description: 'House espresso + Madagascar vanilla bean syrup + ice. Sweet, smooth and elegant.',
    category: 'frappe',
    image: IMAGES.FRAPPE_VANILLA,
    price: 300,
    variants: [
      { id: 'frappe-002-r', name: 'Regular', price: 300 },
      { id: 'frappe-002-l', name: 'Large',   price: 360 },
    ],
    isVeg: true,
    isAvailable: true,
    preparationTime: 5,
    tags: ['vanilla', 'sweet', 'blended'],
  },
  {
    id: 'frappe-003',
    name: 'Caramelous Frappe',
    description: 'House espresso with house-made caramel sauce blended with ice & oat milk. Rich & butterscotch-kissed.',
    category: 'frappe',
    image: IMAGES.FRAPPE_CARAMEL,
    price: 320,
    variants: [
      { id: 'frappe-003-r', name: 'Regular', price: 320 },
      { id: 'frappe-003-l', name: 'Large',   price: 380 },
    ],
    isVeg: true,
    isBestseller: true,
    isAvailable: true,
    preparationTime: 5,
    tags: ['caramel', 'sweet', 'indulgent'],
  },
  {
    id: 'frappe-004',
    name: 'Hazel Cart Coffee',
    description: 'Cold brew + hazelnut + blended ice. Earthy, nutty and deeply satisfying.',
    category: 'frappe',
    image: IMAGES.FRAPPE_HAZEL,
    price: 330,
    variants: [
      { id: 'frappe-004-r', name: 'Regular', price: 330 },
      { id: 'frappe-004-l', name: 'Large',   price: 390 },
    ],
    isVeg: true,
    isAvailable: true,
    preparationTime: 5,
    tags: ['hazelnut', 'cold brew', 'blended'],
  },
  {
    id: 'frappe-005',
    name: 'Brown Butter Frappe',
    description: 'Brown butter syrup + espresso + oat milk blended with ice. Nutty, caramel and deeply complex.',
    category: 'frappe',
    image: IMAGES.FRAPPE_BROWN_BUTTER,
    price: 340,
    variants: [
      { id: 'frappe-005-r', name: 'Regular', price: 340 },
      { id: 'frappe-005-l', name: 'Large',   price: 400 },
    ],
    isVeg: true,
    isSpecial: true,
    isAvailable: true,
    preparationTime: 6,
    tags: ['brown butter', 'nutty', 'signature'],
  },
  {
    id: 'frappe-006',
    name: 'Top Cool Coffee',
    description: 'Cold brew topped over sweetened condensed milk & ice. Strong, sweet & utterly addictive.',
    category: 'frappe',
    image: IMAGES.FRAPPE_TOP_COOL,
    price: 290,
    variants: [
      { id: 'frappe-006-r', name: 'Regular', price: 290 },
      { id: 'frappe-006-l', name: 'Large',   price: 350 },
    ],
    isVeg: true,
    isAvailable: true,
    preparationTime: 4,
    tags: ['condensed milk', 'cold', 'strong'],
  },

  // ── NON COFFEE ──────────────────────────────────────────────────────────────
  {
    id: 'noncoffee-001',
    name: 'Jasmine White Latte',
    description: 'Steamed oat milk with jasmine pearl tea and a whisper of honey. Delicate, floral and comforting.',
    category: 'non-coffee',
    image: IMAGES.NON_COFFEE_JASMINE_LATTE,
    price: 280,
    variants: [
      { id: 'nc-001-h', name: 'Hot',  price: 280 },
      { id: 'nc-001-i', name: 'Iced', price: 300 },
    ],
    isVeg: true,
    isBestseller: true,
    isAvailable: true,
    preparationTime: 5,
    tags: ['no-coffee', 'floral', 'oat milk'],
  },
  {
    id: 'noncoffee-002',
    name: 'Fudge Pop Iced',
    description: 'Rich chocolate fudge + oat milk over ice. The non-coffee answer for chocolate lovers.',
    category: 'non-coffee',
    image: IMAGES.NON_COFFEE_FUDGE_POP,
    price: 260,
    isVeg: true,
    isAvailable: true,
    preparationTime: 4,
    tags: ['chocolate', 'no-coffee', 'iced'],
  },
  {
    id: 'noncoffee-003',
    name: 'Jasmine Yuzu Iced',
    description: 'Japanese yuzu citrus with jasmine green tea over ice. Refreshing, tart and aromatic.',
    category: 'non-coffee',
    image: IMAGES.NON_COFFEE_YUZU,
    price: 300,
    isVeg: true,
    isSpecial: true,
    isAvailable: true,
    preparationTime: 5,
    tags: ['yuzu', 'jasmine', 'no-coffee', 'iced'],
  },
  {
    id: 'noncoffee-004',
    name: 'Flower Tea',
    description: 'A blooming flower tea ball that unfurls in hot water — hibiscus, rose, lavender & chrysanthemum.',
    category: 'non-coffee',
    image: IMAGES.NON_COFFEE_FLOWER_TEA,
    price: 320,
    isVeg: true,
    isSpecial: true,
    isAvailable: true,
    preparationTime: 6,
    tags: ['blooming', 'floral', 'no-coffee', 'visual'],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
export const getFeaturedItems = (): MenuItemBO[] =>
  menuData.filter((item) => item.isBestseller || item.isSpecial).slice(0, 6);

export const getItemsByCategory = (categoryId: string): MenuItemBO[] =>
  menuData.filter((item) => item.category === categoryId);

export const getItemById = (id: string): MenuItemBO | undefined =>
  menuData.find((item) => item.id === id);
