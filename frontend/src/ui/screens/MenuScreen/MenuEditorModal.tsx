import { useEffect, useState } from 'react';
import { Check, ImagePlus, Loader2, X } from 'lucide-react';
import Modal from '@/ui/reusables/Modal/Modal.tsx';
import type { MenuItemBO } from '@/types/menu/MenuItemBO.ts';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface MenuEditorData {
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  isAvailable: boolean;
}

interface CategoryOption {
  id: string;
  label: string;
  emoji: string;
}

interface MenuEditorModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  item?: MenuItemBO | null;
  categories: ReadonlyArray<CategoryOption>;
  onClose: () => void;
  onSave: (data: MenuEditorData) => void;
  isSaving?: boolean;
  error?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MenuEditorModal({
  isOpen,
  mode,
  item,
  categories,
  onClose,
  onSave,
  isSaving = false,
  error = null,
}: MenuEditorModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(categories[0]?.id ?? '');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [fileError, setFileError] = useState<string | null>(null);

  // Prefill the form whenever the modal opens (for edit mode use the item)
  useEffect(() => {
    if (!isOpen) return;
    setName(item?.name ?? '');
    setCategory(item?.category ?? categories[0]?.id ?? '');
    setPrice(item ? String(item.price) : '');
    setDescription(item?.description ?? '');
    setImageSrc(item?.image ?? '');
    setIsAvailable(item?.isAvailable ?? true);
    setFileError(null);
  }, [isOpen, item, categories]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFileError('Please choose a valid image file.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageSrc(reader.result);
        setFileError(null);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  const priceNumber = Number(price);
  const isValid =
    name.trim().length > 0 &&
    category.length > 0 &&
    !Number.isNaN(priceNumber) &&
    priceNumber >= 0;

  function handleSave() {
    if (!isValid) return;
    onSave({
      name: name.trim(),
      category,
      price: priceNumber,
      description: description.trim(),
      image: imageSrc,
      isAvailable,
    });
  }

  const isUnavailable = !isAvailable;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add New Item' : 'Edit Item'}
      size="md"
    >
      <div className="space-y-5">
        {/* Form-level error */}
        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 font-body text-sm"
          >
            {error}
          </div>
        )}

        {/* Photo upload — responsive preview fits the item box exactly */}
        <div>
          <span className="input-label">Photo</span>
          <div className="relative rounded-2xl overflow-hidden bg-soroco-linen aspect-[4/3] w-full group">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Item preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-2 text-soroco-tan">
                <ImagePlus className="w-8 h-8" />
                <span className="font-body text-xs text-center px-4">
                  Tap or drop a photo here
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Upload item photo"
              title="Upload item photo"
            />
            {imageSrc && (
              <>
                <span className="absolute bottom-2 left-2 badge bg-soroco-espresso/70 text-soroco-cream">
                  Tap to change
                </span>
                <button
                  type="button"
                  onClick={() => setImageSrc('')}
                  className="btn-icon absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white"
                  aria-label="Remove photo"
                >
                  <X className="w-4 h-4 text-soroco-espresso" />
                </button>
              </>
            )}
          </div>
          {fileError && (
            <p className="font-body text-xs text-red-600 mt-1.5">{fileError}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label htmlFor="item-name" className="input-label">Item Name</label>
          <input
            id="item-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cold Brew Latte"
            className="input-field"
            disabled={isSaving}
          />
        </div>

        {/* Category + Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="item-category" className="input-label">Category</label>
            <select
              id="item-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
              disabled={isSaving}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="item-price" className="input-label">Price (₹)</label>
            <input
              id="item-price"
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="input-field"
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="item-desc" className="input-label">Description</label>
          <textarea
            id="item-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short, tempting description…"
            rows={3}
            maxLength={200}
            className="input-field resize-none text-sm"
            disabled={isSaving}
          />
        </div>

        {/* Availability */}
        <div>
          <span className="input-label">Status</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsAvailable(true)}
              disabled={isSaving}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-full border-2 font-body font-semibold text-sm transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soroco-amber',
                !isUnavailable
                  ? 'border-soroco-amber bg-soroco-amber text-white'
                  : 'border-soroco-linen text-soroco-mocha hover:border-soroco-amber hover:text-soroco-amber',
              ].join(' ')}
            >
              <Check className="w-4 h-4" /> Available
            </button>
            <button
              type="button"
              onClick={() => setIsAvailable(false)}
              disabled={isSaving}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-full border-2 font-body font-semibold text-sm transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
                isUnavailable
                  ? 'border-red-500 bg-red-500 text-white'
                  : 'border-soroco-linen text-soroco-mocha hover:border-red-400 hover:text-red-500',
              ].join(' ')}
            >
              <X className="w-4 h-4" /> Unavailable
            </button>
          </div>
          <p className="font-body text-xs text-soroco-tan mt-1.5">
            Unavailable items are greyed out for customers and cannot be ordered.
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost text-sm"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !isValid}
            className="btn-primary text-sm py-2.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving…
              </>
            ) : mode === 'add' ? (
              'Add Item'
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}