import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { menuScreenService } from '@/services/screens/menuScreenService/MenuScreenService.ts';
import { MENU_CATEGORIES } from '@/services/screens/menuScreenService/menuData.ts';
import { useAppSelector, useAppDispatch } from '@/store/hooks.ts';
import { addItem } from '@/store/slices/cartSlice.ts';
import type { MenuItemBO, MenuItemVariantBO, MenuItemAddonBO } from '@/types/menu/MenuItemBO.ts';
import type { CartItemBO } from '@/types/cart/CartItemBO.ts';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface CategoryMeta {
  id: string;
  label: string;
  emoji: string;
}

export interface MenuSection {
  category: CategoryMeta;
  items: MenuItemBO[];
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useMenuScreenVM() {
  const dispatch      = useAppDispatch();
  const [searchParams] = useSearchParams();

  // ── State ──────────────────────────────────────────────────────────────────
  const [sections,       setSections]       = useState<MenuSection[]>([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedItem,   setSelectedItem]   = useState<MenuItemBO | null>(null);
  const [isDetailOpen,   setIsDetailOpen]   = useState(false);

  // Detail form state
  const [selectedVariant,  setSelectedVariant]  = useState<MenuItemVariantBO | null>(null);
  const [selectedAddons,   setSelectedAddons]   = useState<MenuItemAddonBO[]>([]);
  const [quantity,         setQuantity]         = useState(1);
  const [specialNote,      setSpecialNote]      = useState('');

  // Cart from Redux
  const cartItems = useAppSelector((s) => s.cart.items);

  // Refs for section scroll targets
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const categoryNavRef = useRef<HTMLDivElement | null>(null);
  const isScrollingProgrammatically = useRef(false);

  // ── Load menu data ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadMenu() {
      setIsLoading(true);
      try {
        const [allItems] = await Promise.all([menuScreenService.getMenu()]);

        const built: MenuSection[] = MENU_CATEGORIES.map((cat) => ({
          category: cat,
          items: allItems.filter((item) => item.category === cat.id),
        })).filter((s) => s.items.length > 0);

        setSections(built);

        // Set initial active category from query param or first section
        const queryCategory = searchParams.get('category');
        const initial =
          built.find((s) => s.category.id === queryCategory)?.category.id ??
          built[0]?.category.id ??
          '';
        setActiveCategory(initial);
      } catch (err) {
        console.error('[MenuScreen] Failed to load menu:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Scroll to section from query param on mount (after sections load) ──────
  useEffect(() => {
    const queryCategory = searchParams.get('category');
    if (!queryCategory || sections.length === 0) return;

    const el = sectionRefs.current[queryCategory];
    if (!el) return;

    setTimeout(() => {
      const navHeight = 72 + 56; // navbar + category nav
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 150);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  // ── Intersection Observer: update activeCategory while scrolling ───────────
  useEffect(() => {
    if (sections.length === 0) return;

    const observers: IntersectionObserver[] = [];
    const NAV_OFFSET = 160; // px — estimated navbar + cat-nav height

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingProgrammatically.current) return;

        // Find the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const id = visible[0].target.id;
          setActiveCategory(id);
          scrollCategoryNavToActive(id);
        }
      },
      {
        rootMargin: `-${NAV_OFFSET}px 0px -50% 0px`,
        threshold: 0,
      },
    );

    sections.forEach((s) => {
      const el = sectionRefs.current[s.category.id];
      if (el) observer.observe(el);
    });

    observers.push(observer);
    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  // ── Scroll category pill nav to show active tab ────────────────────────────
  function scrollCategoryNavToActive(categoryId: string) {
    const nav = categoryNavRef.current;
    if (!nav) return;
    const pill = nav.querySelector<HTMLElement>(`[data-category="${categoryId}"]`);
    if (!pill) return;
    const navRect  = nav.getBoundingClientRect();
    const pillRect = pill.getBoundingClientRect();
    const offset   = pillRect.left - navRect.left - navRect.width / 2 + pillRect.width / 2;
    nav.scrollBy({ left: offset, behavior: 'smooth' });
  }

  // ── Handle category pill click ─────────────────────────────────────────────
  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);

    const el = sectionRefs.current[categoryId];
    if (!el) return;

    isScrollingProgrammatically.current = true;
    const navHeight = 72 + 56; // navbar 72px + cat nav 56px
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 16;
    window.scrollTo({ top, behavior: 'smooth' });

    // Re-enable intersection observer after scroll settles
    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 900);
  }, []);

  // ── Open item detail ───────────────────────────────────────────────────────
  const handleViewDetail = useCallback((item: MenuItemBO) => {
    setSelectedItem(item);
    // Reset form state
    setSelectedVariant(item.variants?.[0] ?? null);
    setSelectedAddons([]);
    setQuantity(1);
    setSpecialNote('');
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedItem(null), 300);
  }, []);

  // ── Variant/addon selection ────────────────────────────────────────────────
  const handleVariantSelect = useCallback((variant: MenuItemVariantBO) => {
    setSelectedVariant(variant);
  }, []);

  const handleAddonToggle = useCallback((addon: MenuItemAddonBO) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon],
    );
  }, []);

  const handleQuantityChange = useCallback((next: number) => {
    if (next < 1) return;
    setQuantity(next);
  }, []);

  // ── Calculate detail total ─────────────────────────────────────────────────
  function getDetailTotal(): number {
    if (!selectedItem) return 0;
    const base  = selectedVariant?.price ?? selectedItem.price;
    const addonsTotal = selectedAddons.reduce((acc, a) => acc + a.price, 0);
    return (base + addonsTotal) * quantity;
  }

  // ── Add to cart from detail ────────────────────────────────────────────────
  const handleAddToCart = useCallback(
    (item: MenuItemBO) => {
      const base      = selectedVariant?.price ?? item.price;
      const addonsTotal = selectedAddons.reduce((acc, a) => acc + a.price, 0);
      const unitPrice = base + addonsTotal;

      const cartItem: CartItemBO = {
        cartItemId: `${item.id}-${selectedVariant?.id ?? 'default'}-${Date.now()}`,
        menuItemId: item.id,
        name: item.name,
        image: item.image,
        variant: selectedVariant?.name,
        variantId: selectedVariant?.id,
        addons: selectedAddons.map((a) => a.name),
        addonIds: selectedAddons.map((a) => a.id),
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        specialInstructions: specialNote.trim() || undefined,
        isVeg: item.isVeg,
      };

      dispatch(addItem(cartItem));
      handleCloseDetail();
    },
    [dispatch, selectedVariant, selectedAddons, quantity, specialNote, handleCloseDetail],
  );

  // ── Quick add from card (no detail) ───────────────────────────────────────
  const handleQuickAddToCart = useCallback(
    (_item: MenuItemBO) => {
      // FoodCard handles this internally via Redux; this is a no-op callback for the prop
    },
    [],
  );

  // ── Register section ref ───────────────────────────────────────────────────
  const registerSectionRef = useCallback(
    (categoryId: string) => (el: HTMLElement | null) => {
      sectionRefs.current[categoryId] = el;
    },
    [],
  );

  return {
    // Data
    sections,
    isLoading,
    activeCategory,
    cartItems,

    // Detail modal state
    selectedItem,
    isDetailOpen,
    selectedVariant,
    selectedAddons,
    quantity,
    specialNote,

    // Computed
    getDetailTotal,

    // Handlers
    handleCategoryChange,
    handleViewDetail,
    handleCloseDetail,
    handleVariantSelect,
    handleAddonToggle,
    handleQuantityChange,
    setSpecialNote,
    handleAddToCart,
    handleQuickAddToCart,

    // Refs
    categoryNavRef,
    registerSectionRef,
  };
}
