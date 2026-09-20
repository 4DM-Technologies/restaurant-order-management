import { useEffect, useState, useRef } from 'react';
import type React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Clock,
  Leaf,
  StickyNote,
  AlertCircle,
  ChevronDown,
  Check,
  ChefHat,
} from 'lucide-react';
import Navbar from '@/ui/reusables/Navbar/Navbar.tsx';
import CartBar from '@/ui/reusables/CartBar/CartBar.tsx';
import FoodCard from '@/ui/reusables/FoodCard/FoodCard.tsx';
import Modal from '@/ui/reusables/Modal/Modal.tsx';
import BottomSheet from '@/ui/reusables/BottomSheet/BottomSheet.tsx';
import ConfirmDialog from '@/ui/reusables/ConfirmDialog/ConfirmDialog.tsx';
import Reveal from '@/ui/reusables/Reveal/Reveal.tsx';
import LoadingSkeleton from '@/ui/reusables/LoadingSkeleton/LoadingSkeleton.tsx';
import DelayedLoader from '@/ui/reusables/BrandLoader/DelayedLoader.tsx';
import MenuEditorModal from '@/ui/screens/MenuScreen/MenuEditorModal.tsx';
import { MENU_CATEGORIES } from '@/services/screens/menuScreenService/menuData.ts';
import { useMenuScreenVM } from '@/ui/screens/MenuScreen/MenuScreen.vm.ts';
import type { MenuItemBO, MenuItemVariantBO, MenuItemAddonBO } from '@/types/menu/MenuItemBO.ts';

// ─── Food detail content (shared between Modal + BottomSheet) ─────────────────
interface FoodDetailContentProps {
  item: MenuItemBO;
  selectedVariant: MenuItemVariantBO | null;
  selectedAddons: MenuItemAddonBO[];
  quantity: number;
  specialNote: string;
  onVariantSelect: (v: MenuItemVariantBO) => void;
  onAddonToggle: (a: MenuItemAddonBO) => void;
  onQuantityChange: (n: number) => void;
  onNoteChange: (n: string) => void;
  onAddToCart: (item: MenuItemBO) => void;
  total: number;
}

function FoodDetailContent({
  item,
  selectedVariant,
  selectedAddons,
  quantity,
  specialNote,
  onVariantSelect,
  onAddonToggle,
  onQuantityChange,
  onNoteChange,
  onAddToCart,
  total,
}: FoodDetailContentProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="space-y-0">
      {/* Image */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-soroco-linen mb-6 -mx-6 -mt-6">
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={item.image}
          alt={item.name}
          onLoad={() => setImgLoaded(true)}
          className={[
            'w-full h-full object-cover img-fade',
            imgLoaded ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />
        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {item.isBestseller && (
            <span className="badge-bestseller flex items-center gap-1 shadow-warm-sm">
              <Star className="w-3 h-3 fill-current" />
              Bestseller
            </span>
          )}
          {item.isSpecial && (
            <span className="badge bg-soroco-espresso/90 text-soroco-cream">
              Chef's Special
            </span>
          )}
          {!item.isAvailable && (
            <span className="badge-unavailable flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Unavailable
            </span>
          )}
        </div>
      </div>

      {/* Title row */}
      <div className="flex items-start gap-3 mb-2">
        {/* Veg dot */}
        <span
          className={[
            'mt-1 w-4 h-4 border-2 rounded-sm shrink-0 flex items-center justify-center',
            item.isVeg ? 'border-green-600' : 'border-red-600',
          ].join(' ')}
          aria-label={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
        >
          <span
            className={[
              'w-2 h-2 rounded-full',
              item.isVeg ? 'bg-green-600' : 'bg-red-600',
            ].join(' ')}
          />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-xl font-bold text-soroco-charcoal leading-tight">
            {item.name}
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-soroco-tan font-body">
            {item.preparationTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />~{item.preparationTime} min
              </span>
            )}
            {item.isVeg && (
              <span className="flex items-center gap-1">
                <Leaf className="w-3 h-3 text-green-500" />Pure Veg
              </span>
            )}
          </div>
        </div>
        <span className="font-body font-bold text-soroco-espresso text-xl shrink-0">
          ₹{(selectedVariant?.price ?? item.price).toFixed(2)}
        </span>
      </div>

      {/* Description */}
      <p className="body-md text-soroco-mocha/80 mb-5 leading-relaxed">{item.description}</p>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="font-body text-xs px-3 py-1 bg-soroco-linen text-soroco-mocha rounded-full capitalize"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Variants */}
      {item.variants && item.variants.length > 0 && (
        <div className="mb-6">
          <p className="font-body font-semibold text-soroco-espresso text-sm mb-3">
            Choose Size / Variant
          </p>
          <div className="flex flex-wrap gap-2">
            {item.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => onVariantSelect(v)}
                className={[
                  'px-4 py-2 rounded-full border-2 font-body font-semibold text-sm transition-all duration-150 active:scale-95',
                  selectedVariant?.id === v.id
                    ? 'border-soroco-amber bg-soroco-amber text-white'
                    : 'border-soroco-linen text-soroco-mocha hover:border-soroco-amber hover:text-soroco-amber',
                ].join(' ')}
              >
                {v.name}
                <span className="ml-1.5 font-normal opacity-75">+₹{v.price}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Addons */}
      {item.addons && item.addons.length > 0 && (
        <div className="mb-6">
          <p className="font-body font-semibold text-soroco-espresso text-sm mb-3">
            Add-ons <span className="font-normal text-soroco-tan">(optional)</span>
          </p>
          <div className="space-y-2">
            {item.addons.map((addon) => {
              const isChecked = !!selectedAddons.find((a) => a.id === addon.id);
              return (
                <label
                  key={addon.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-soroco-linen cursor-pointer hover:border-soroco-amber/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                        isChecked
                          ? 'border-soroco-amber bg-soroco-amber'
                          : 'border-soroco-linen',
                      ].join(' ')}
                    >
                      {isChecked && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 text-white"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </motion.svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isChecked}
                      onChange={() => onAddonToggle(addon)}
                      aria-label={addon.name}
                    />
                    <span className="font-body text-sm text-soroco-charcoal">{addon.name}</span>
                  </div>
                  <span className="font-body font-semibold text-sm text-soroco-amber">
                    +₹{addon.price}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Special instructions */}
      <div className="mb-6">
        <label
          htmlFor="special-note"
          className="flex items-center gap-2 font-body font-semibold text-soroco-espresso text-sm mb-2"
        >
          <StickyNote className="w-4 h-4 text-soroco-tan" />
          Special Instructions{' '}
          <span className="font-normal text-soroco-tan">(optional)</span>
        </label>
        <textarea
          id="special-note"
          value={specialNote}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="E.g. less sugar, extra hot, no cream…"
          rows={2}
          maxLength={200}
          className="input-field resize-none text-sm"
        />
      </div>

      {/* Quantity + Add to cart */}
      <div className="flex items-center gap-4 pt-2">
        {/* Quantity control */}
        <div className="flex items-center border-2 border-soroco-linen rounded-full overflow-hidden shrink-0">
          <button
            onClick={() => onQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="w-10 h-10 flex items-center justify-center text-soroco-espresso hover:bg-soroco-linen transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
          </button>
          <AnimatePresence mode="wait">
            <motion.span
              key={quantity}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="w-8 text-center font-body font-bold text-soroco-charcoal text-base"
              aria-live="polite"
              aria-label={`Quantity: ${quantity}`}
            >
              {quantity}
            </motion.span>
          </AnimatePresence>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            aria-label="Increase quantity"
            className="w-10 h-10 flex items-center justify-center text-soroco-espresso hover:bg-soroco-linen transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add to cart button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => onAddToCart(item)}
          disabled={!item.isAvailable}
          className={[
            'flex-1 flex items-center justify-between gap-3 px-5 py-3 rounded-full font-body font-bold text-base transition-all duration-200',
            item.isAvailable
              ? 'bg-soroco-amber text-white hover:bg-soroco-sienna hover:shadow-warm-md active:scale-95'
              : 'bg-soroco-linen text-soroco-tan cursor-not-allowed',
          ].join(' ')}
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </span>
          <span className="font-bold">₹{total.toFixed(2)}</span>
        </motion.button>
      </div>
    </div>
  );
}

// ─── Modern Category Navigation ───────────────────────────────────────────────
// Desktop: horizontal underline tabs (clean, modern)
// Mobile: floating dropdown selector (bottom-sheet style)
interface CategoryNavProps {
  sections: Array<{ category: { id: string; label: string; emoji: string }; items: unknown[] }>;
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  navRef: React.Ref<HTMLDivElement>;
}

function CategoryNav({ sections, activeCategory, onCategoryChange, navRef }: CategoryNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeSection = sections.find((s) => s.category.id === activeCategory);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [dropdownOpen]);

  function handleSelect(id: string) {
    onCategoryChange(id);
    setDropdownOpen(false);
  }

  return (
    <div
      className="sticky z-40 bg-white/95 backdrop-blur-md border-b border-soroco-linen shadow-warm-sm"
      style={{ top: 72 }}
    >
      <div className="section-container">

        {/* ── DESKTOP: horizontal underline tabs ── */}
        <div
          ref={navRef}
          className="hidden md:flex gap-0 overflow-x-auto no-scrollbar"
          role="tablist"
          aria-label="Menu categories"
        >
          {sections.map((s) => {
            const isActive = s.category.id === activeCategory;
            return (
              <button
                key={s.category.id}
                role="tab"
                data-category={s.category.id}
                aria-selected={isActive}
                onClick={() => onCategoryChange(s.category.id)}
                className={[
                  'relative shrink-0 px-5 py-4 font-body font-semibold text-sm transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soroco-amber focus-visible:ring-inset',
                  isActive
                    ? 'text-soroco-espresso'
                    : 'text-soroco-mocha hover:text-soroco-espresso',
                ].join(' ')}
              >
                {s.category.label}
                {/* Active underline */}
                {isActive && (
                  <motion.span
                    layoutId="category-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-soroco-amber rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── MOBILE: dropdown selector ── */}
        <div className="md:hidden relative py-2.5 px-1" ref={dropdownRef}>
          {/* Trigger button */}
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
            className="w-full flex items-center justify-between gap-3 bg-soroco-parchment hover:bg-soroco-linen
                       border border-soroco-linen rounded-xl px-4 py-3 transition-colors duration-150
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soroco-amber"
          >
            <span className="font-body font-semibold text-soroco-espresso text-sm">
              {activeSection?.category.label ?? 'Select Category'}
            </span>
            <motion.span
              animate={{ rotate: dropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-soroco-mocha shrink-0" />
            </motion.span>
          </button>

          {/* Dropdown panel */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                role="listbox"
                aria-label="Menu categories"
                className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-warm-lg
                           border border-soroco-linen overflow-hidden z-50"
              >
                {sections.map((s, i) => {
                  const isActive = s.category.id === activeCategory;
                  return (
                    <motion.button
                      key={s.category.id}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => handleSelect(s.category.id)}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={[
                        'w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors duration-150',
                        i < sections.length - 1 ? 'border-b border-soroco-linen/60' : '',
                        isActive
                          ? 'bg-soroco-amber/8 text-soroco-espresso'
                          : 'text-soroco-mocha hover:bg-soroco-parchment hover:text-soroco-espresso',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg" aria-hidden="true">{s.category.emoji}</span>
                        <span className="font-body font-semibold text-sm">{s.category.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-soroco-tan font-body">
                          {(s.items as unknown[]).length}
                        </span>
                        {isActive && (
                          <Check className="w-4 h-4 text-soroco-amber" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

// ─── MenuScreen ────────────────────────────────────────────────────────────────
export default function MenuScreen() {
  const vm = useMenuScreenVM();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile breakpoint
  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768);
    }
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // Shared detail panel content
  const detailContent = vm.selectedItem ? (
    <FoodDetailContent
      item={vm.selectedItem}
      selectedVariant={vm.selectedVariant}
      selectedAddons={vm.selectedAddons}
      quantity={vm.quantity}
      specialNote={vm.specialNote}
      onVariantSelect={vm.handleVariantSelect}
      onAddonToggle={vm.handleAddonToggle}
      onQuantityChange={vm.handleQuantityChange}
      onNoteChange={vm.setSpecialNote}
      onAddToCart={vm.handleAddToCart}
      total={vm.getDetailTotal()}
    />
  ) : null;

  return (
    <div className="min-h-screen bg-soroco-cream">
      {/* Navbar */}
      <Navbar />

      {/* Page content — offset for fixed navbar */}
      <div style={{ paddingTop: 72 }}>

        {/* Staff toolbar — Add New Item (admin / employee only) */}
        {vm.isStaff && !vm.isLoading && (
          <div className="bg-white/70 border-b border-soroco-linen backdrop-blur-sm">
            <div className="section-container py-3 flex items-center justify-between gap-3">
              <p className="hidden sm:flex items-center gap-2 font-body text-sm text-soroco-mocha">
                <ChefHat className="w-4 h-4 text-soroco-amber" />
                Menu Management
                <span className="text-soroco-tan">·</span>
                <span className="text-soroco-tan">You can add, edit &amp; remove items</span>
              </p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={vm.openAddEditor}
                className="btn-primary text-sm py-2 px-4 ml-auto sm:ml-0"
              >
                <Plus className="w-4 h-4" />
                Add New Item
              </motion.button>
            </div>
          </div>
        )}

        {/* Category navigation — sticky below navbar */}
        {!vm.isLoading && vm.sections.length > 0 && (
          <CategoryNav
            sections={vm.sections}
            activeCategory={vm.activeCategory}
            onCategoryChange={vm.handleCategoryChange}
            navRef={vm.categoryNavRef}
          />
        )}

        {/* Menu sections */}
        <main className="section-container py-8 pb-32">
          {vm.isLoading ? (
            <DelayedLoader
              variant="inline"
              fallback={<LoadingSkeleton variant="card" count={8} />}
            />
          ) : (
            <>
              {vm.sections.map((section, sectionIdx) => (
                <section
                  key={section.category.id}
                  id={section.category.id}
                  ref={vm.registerSectionRef(section.category.id)}
                  className="mb-14 scroll-mt-36"
                >
                  {/* Section heading */}
                  <Reveal y={24} className="flex items-center gap-3 mb-6">
                    <span className="text-3xl" aria-hidden="true">
                      {section.category.emoji}
                    </span>
                    <div>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-soroco-espresso leading-tight">
                        {section.category.label}
                      </h2>
                      <p className="font-body text-xs text-soroco-tan mt-0.5">
                        {section.items.length} item{section.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex-1 h-px bg-soroco-linen ml-3" />
                  </Reveal>

                  {/* Food card grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                    {section.items.map((item, itemIdx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 28, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: false, margin: '-10% 0px' }}
                        transition={{
                          duration: 0.5,
                          delay: Math.min(itemIdx * 0.06, 0.3),
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <FoodCard
                          item={item}
                          onAddToCart={vm.handleQuickAddToCart}
                          onViewDetail={vm.handleViewDetail}
                          isStaff={vm.isStaff}
                          onEdit={vm.openEditEditor}
                          onDelete={vm.openDeleteDialog}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Section divider (except last) */}
                  {sectionIdx < vm.sections.length - 1 && (
                    <div className="mt-14 divider" />
                  )}
                </section>
              ))}

              {/* Empty state */}
              {vm.sections.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <span className="text-6xl mb-4">☕</span>
                  <h3 className="heading-sm text-soroco-espresso mb-2">Menu not available</h3>
                  <p className="body-md text-soroco-mocha/60">
                    Please check back shortly while we prepare things.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Food Detail — BottomSheet on mobile, Modal on desktop */}
      {isMobile ? (
        <BottomSheet
          isOpen={vm.isDetailOpen}
          onClose={vm.handleCloseDetail}
          title={vm.selectedItem?.name}
        >
          {detailContent}
        </BottomSheet>
      ) : (
        <Modal
          isOpen={vm.isDetailOpen}
          onClose={vm.handleCloseDetail}
          size="lg"
        >
          {detailContent}
        </Modal>
      )}

      {/* Sticky cart bar */}
      <CartBar />

      {/* Add / Edit menu item modal (staff only) */}
      <MenuEditorModal
        isOpen={vm.isEditorOpen}
        mode={vm.editorMode}
        item={vm.editorItem}
        categories={MENU_CATEGORIES}
        onClose={vm.closeEditor}
        onSave={vm.handleSaveEditor}
        isSaving={vm.isSaving}
        error={vm.editorError}
      />

      {/* Remove item confirmation (staff only) */}
      <ConfirmDialog
        isOpen={vm.isDeleteDialogOpen}
        onClose={() => vm.setIsDeleteDialogOpen(false)}
        onConfirm={vm.handleDeleteItem}
        title="Remove Menu Item"
        message={`Are you sure you want to remove "${vm.itemToDelete?.name ?? 'this item'}" from the menu? This action cannot be undone.`}
        confirmLabel="Remove"
        isDanger
      />
    </div>
  );
}
