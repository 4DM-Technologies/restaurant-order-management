import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check,
  ImagePlus,
  Loader2,
  Move,
  X,
} from 'lucide-react';
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
  imageFile: File | null;
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

// ─── Zoom/pan photo editor ─────────────────────────────────────────────────────
// Mirrors the food-card 4:3 box — user can zoom in/out and drag to reposition,
// then the visible region is rendered to a webp file on save.
interface CropState {
  naturalW: number;
  naturalH: number;
  boxW: number;
  boxH: number;
  zoom: number;
  panX: number;
  panY: number;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;
const OUTPUT_W = 640;

function useImageEditor(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [state, setState] = useState<CropState | null>(null);

  // Measure the 4:3 box whenever it changes (resize included)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const node: HTMLDivElement = el;
    function measure() {
      setState((prev) => (prev ? { ...prev, boxW: node.clientWidth, boxH: node.clientHeight } : prev));
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
    // Re-run once a photo loads so the box mounts & is measured inside the modal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, state?.naturalW, state?.naturalH]);

  const clampPan = useCallback(
    (st: CropState): CropState => {
      const scale = st.zoom * Math.max(st.boxW / st.naturalW, st.boxH / st.naturalH);
      const maxX = Math.max((st.naturalW * scale - st.boxW) / 2, 0);
      const maxY = Math.max((st.naturalH * scale - st.boxH) / 2, 0);
      return {
        ...st,
        panX: Math.min(Math.max(st.panX, -maxX), maxX),
        panY: Math.min(Math.max(st.panY, -maxY), maxY),
      };
    },
    [],
  );

  const initFromImage = useCallback((naturalW: number, naturalH: number) => {
    setState((prev) => ({
      naturalW,
      naturalH,
      boxW: prev?.boxW ?? 0,
      boxH: prev?.boxH ?? 0,
      zoom: MIN_ZOOM,
      panX: 0,
      panY: 0,
    }));
  }, []);

  const setZoom = useCallback(
    (zoom: number) => {
      setState((prev) => {
        if (!prev) return prev;
        const clamped = Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM);
        const factor = clamped / prev.zoom;
        return clampPan({
          ...prev,
          zoom: clamped,
          panX: prev.panX * factor,
          panY: prev.panY * factor,
        });
      });
    },
    [clampPan],
  );

  // Combined update used by pinch-zoom + drag gestures (single clamp pass).
  const setZoomAndPan = useCallback(
    (zoom: number, panX: number, panY: number) => {
      setState((prev) =>
        prev
          ? clampPan({
              ...prev,
              zoom: Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM),
              panX,
              panY,
            })
          : prev,
      );
    },
    [clampPan],
  );

  const panBy = useCallback(
    (dx: number, dy: number) => {
      setState((prev) =>
        prev ? clampPan({ ...prev, panX: prev.panX + dx, panY: prev.panY + dy }) : prev,
      );
    },
    [clampPan],
  );

  const reset = useCallback(() => {
    setState((prev) => (prev ? { ...prev, zoom: MIN_ZOOM, panX: 0, panY: 0 } : prev));
  }, []);

  const coverScale = (st: CropState) =>
    st.boxW > 0 && st.boxH > 0
      ? st.zoom * Math.max(st.boxW / st.naturalW, st.boxH / st.naturalH)
      : 0;

  // Renders the visible crop region from the natural image back into a webp file.
  const renderToFile = useCallback(
    (image: HTMLImageElement): Promise<File | null> => {
      return new Promise((resolve) => {
        if (!state || state.boxW === 0 || state.boxH === 0) {
          resolve(null);
          return;
        }
        const scale = coverScale(state);
        const dispW = state.naturalW * scale;
        const dispH = state.naturalH * scale;
        const offX = (state.boxW - dispW) / 2 + state.panX;
        const offY = (state.boxH - dispH) / 2 + state.panY;
        const srcX = -offX / scale;
        const srcY = -offY / scale;
        const srcW = state.boxW / scale;
        const srcH = state.boxH / scale;

        const outH = Math.max(Math.round((OUTPUT_W * state.boxH) / state.boxW), 1);
        const canvas = document.createElement('canvas');
        canvas.width = OUTPUT_W;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(
          image,
          Math.max(srcX, 0),
          Math.max(srcY, 0),
          Math.min(srcW, state.naturalW - Math.max(srcX, 0)),
          Math.min(srcH, state.naturalH - Math.max(srcY, 0)),
          0,
          0,
          OUTPUT_W,
          outH,
        );
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(null);
              return;
            }
            resolve(new File([blob], 'menu-item.webp', { type: 'image/webp' }));
          },
          'image/webp',
          0.9,
        );
      });
    },
    [state],
  );

  return { state, initFromImage, setZoom, setZoomAndPan, panBy, reset, renderToFile, coverScale };
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
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isFreshPhoto = imageFile != null && imageSrc.startsWith('data:');
  const hasPhoto = imageSrc !== '';

  const previewRef = useRef<HTMLImageElement | null>(null);
  const editorBoxRef = useRef<HTMLDivElement | null>(null);
  const editor = useImageEditor(editorBoxRef);
  const gestureRef = useRef<{
    pointers: Map<number, { x: number; y: number }>;
    last: { x: number; y: number } | null;
    lastMoved: boolean;
    pinch: {
      startDistance: number;
      startZoom: number;
      startMidX: number;
      startMidY: number;
      panBaseX: number;
      panBaseY: number;
    } | null;
  }>({
    pointers: new Map(),
    last: null,
    lastMoved: false,
    pinch: null,
  });
  const [isDragging, setIsDragging] = useState(false);

  // Mouse-wheel zoom (native non-passive listener so preventDefault works)
  const gestureZoomRef = useRef(1);
  gestureZoomRef.current = editor.state?.zoom ?? 1;
  useEffect(() => {
    const el = editorBoxRef.current;
    if (!el || !hasPhoto) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      editor.setZoom((gestureZoomRef.current ?? 1) + delta);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [hasPhoto, editor.setZoom]);

  // Prefill the form whenever the modal opens (for edit mode use the item)
  useEffect(() => {
    if (!isOpen) return;
    setName(item?.name ?? '');
    setCategory(item?.category ?? categories[0]?.id ?? '');
    setPrice(item ? String(item.price) : '');
    setDescription(item?.description ?? '');
    setImageSrc(item?.image ?? '');
    setIsAvailable(item?.isAvailable ?? true);
    setImageFile(null);
    setFileError(null);
  }, [isOpen, item, categories]);

  // Reset zoom/pan whenever the photo changes
  useEffect(() => {
    if (imageSrc) editor.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc, editor.reset]);

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
        setImageFile(file);
        setFileError(null);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  // Zoom / pan drives the on-screen preview whenever a photo is shown
  const scaleForPreview = (() => {
    if (!editor.state) return 0;
    return editor.coverScale(editor.state);
  })();

  const imageStyle: React.CSSProperties = {};
  if (editor.state && scaleForPreview > 0) {
    const dispW = editor.state.naturalW * scaleForPreview;
    const dispH = editor.state.naturalH * scaleForPreview;
    const offX = (editor.state.boxW - dispW) / 2 + editor.state.panX;
    const offY = (editor.state.boxH - dispH) / 2 + editor.state.panY;
    imageStyle.width = dispW;
    imageStyle.height = dispH;
    imageStyle.transform = `translate(${offX}px, ${offY}px)`;
    imageStyle.maxWidth = 'none';
  }

  // Pointer gestures: drag to reposition, two-finger pinch to zoom, wheel to zoom
  function distBetween(a: { x: number; y: number }, b: { x: number; y: number }) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function currentPointers() {
    return Array.from(gestureRef.current.pointers.entries());
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!editor.state || !hasPhoto) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = { x: e.clientX, y: e.clientY };
    gestureRef.current.pointers.set(e.pointerId, pos);

    if (gestureRef.current.pointers.size === 1) {
      gestureRef.current.last = pos;
    } else if (gestureRef.current.pointers.size === 2) {
      const [a, b] = currentPointers();
      const mid = { x: (a[1].x + b[1].x) / 2, y: (a[1].y + b[1].y) / 2 };
      gestureRef.current.pinch = {
        startDistance: distBetween(a[1], b[1]),
        startZoom: editor.state.zoom,
        startMidX: mid.x,
        startMidY: mid.y,
        panBaseX: editor.state.panX,
        panBaseY: editor.state.panY,
      };
      gestureRef.current.last = null;
    }
    setIsDragging(true);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (!gesture.pointers.has(e.pointerId)) return;
    const pos = { x: e.clientX, y: e.clientY };
    gesture.pointers.set(e.pointerId, pos);

    // Two-finger pinch => zoom around the fingers' midpoint + drag via midpoint
    if (gesture.pointers.size >= 2 && gesture.pinch) {
      const [a, b] = currentPointers();
      const midX = (a[1].x + b[1].x) / 2;
      const midY = (a[1].y + b[1].y) / 2;
      const distance = distBetween(a[1], b[1]);
      if (distance > 0) {
        const zoom = gesture.pinch.startZoom * (distance / gesture.pinch.startDistance);
        const panX = gesture.pinch.panBaseX + (midX - gesture.pinch.startMidX);
        const panY = gesture.pinch.panBaseY + (midY - gesture.pinch.startMidY);
        editor.setZoomAndPan(zoom, panX, panY);
      }
      gesture.last = null;
      return;
    }

    // Single-pointer drag => reposition
    if (gesture.last) {
      editor.panBy(pos.x - gesture.last.x, pos.y - gesture.last.y);
      gesture.lastMoved = true;
    }
    gesture.last = pos;
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const gesture = gestureRef.current;
    gesture.pointers.delete(e.pointerId);

    if (gesture.pointers.size < 2) {
      gesture.pinch = null;
      const remaining = currentPointers()[0];
      gesture.last = remaining ? remaining[1] : null;
    }
    if (gesture.pointers.size === 0) {
      gesture.last = null;
      setIsDragging(false);
    }
  }

  const priceNumber = Number(price);
  const isValid =
    name.trim().length > 0 &&
    category.length > 0 &&
    !Number.isNaN(priceNumber) &&
    priceNumber >= 0;

  async function handleSave() {
    if (!isValid) return;
    let fileOut = imageFile;
    if (previewRef.current && editor.state) {
      const cropped = await editor.renderToFile(previewRef.current);
      if (isFreshPhoto) {
        fileOut = cropped ?? imageFile;
      } else {
        const adjusted =
          editor.state.zoom !== 1 || editor.state.panX !== 0 || editor.state.panY !== 0;
        if (adjusted && cropped) fileOut = cropped;
      }
    }
    onSave({
      name: name.trim(),
      category,
      price: priceNumber,
      description: description.trim(),
      image: imageSrc,
      isAvailable,
      imageFile: fileOut,
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
          <div
            ref={editorBoxRef}
            className="relative rounded-2xl overflow-hidden bg-soroco-linen aspect-[4/3] w-full group"
          >
            {hasPhoto ? (
              <>
                <div
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  className={[
                    'absolute inset-0 cursor-grab touch-none select-none',
                    isDragging ? 'cursor-grabbing' : '',
                  ].join(' ')}
                  style={{ overflow: 'hidden' }}
                >
                  <img
                    key={imageSrc}
                    ref={previewRef}
                    src={imageSrc}
                    alt="Item preview"
                    draggable={false}
                    crossOrigin={isFreshPhoto ? undefined : 'anonymous'}
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      editor.initFromImage(img.naturalWidth || 1, img.naturalHeight || 1);
                    }}
                    className="absolute left-0 top-0"
                    style={{ ...imageStyle, userSelect: 'none' }}
                  />
                </div>

                <span className="absolute bottom-2 left-2 badge bg-soroco-espresso/70 text-soroco-cream z-10">
                  <Move className="w-3 h-3" />
                  {isDragging ? 'Moving…' : 'Drag · pinch · scroll to zoom & move'}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setImageSrc('');
                    setImageFile(null);
                  }}
                  className="btn-icon absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white z-10"
                  aria-label="Remove photo"
                >
                  <X className="w-4 h-4 text-soroco-espresso" />
                </button>
              </>
            ) : (
              <label
                className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-2 text-soroco-tan cursor-pointer hover:text-soroco-mocha transition-colors"
                role="button"
                aria-label="Upload item photo"
              >
                <ImagePlus className="w-8 h-8" />
                <span className="font-body text-xs text-center px-4">
                  Tap or drop a photo here
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="sr-only"
                />
              </label>
            )}
          </div>

          {fileError && <p className="font-body text-xs text-red-600 mt-1.5">{fileError}</p>}
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
            onClick={() => handleSave()}
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