import type { MenuItemBO } from '@/types/menu/MenuItemBO.ts';
import {
  menuData,
  MENU_CATEGORIES,
  getFeaturedItems,
  getItemsByCategory,
  getItemById,
} from '@/services/screens/menuScreenService/menuData.ts';

// ─── Mutable working copy (mock persistence for the session) ──────────────────
let _menuItems: MenuItemBO[] = [...menuData];

export interface MenuItemInput {
  name: string;
  category: string;
  price: number;
  description: string;
  image?: string;
  isAvailable?: boolean;
}

// Branded placeholder used when a new item is added without a photo
const PLACEHOLDER_IMAGE = [
  'data:image/svg+xml;utf8,',
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">' +
      '<rect width="640" height="480" fill="#F2EDE3"/>' +
      '<g fill="none" stroke="#C8956C" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M255 175 h130 a18 18 0 0 1 0 36 h-130 z"/>' +
      '<path d="M265 300 a55 55 0 0 0 110 0"/>' +
      '<path d="M240 255 h150"/>' +
      '</g>' +
      '<circle cx="420" cy="195" r="18" fill="#C8956C"/>' +
      '<rect x="255" y="230" width="120" height="10" rx="5" fill="#C8956C"/>' +
      '<text x="320" y="380" font-family="Georgia, serif" font-size="34" fill="#6B3F2A" text-anchor="middle" letter-spacing="2">SOROCO HOUSE</text>' +
      '</svg>',
  ),
].join('');

export const menuScreenService = {
  getMenu: async (): Promise<MenuItemBO[]> => {
    await new Promise((r) => setTimeout(r, 400));
    return [..._menuItems];
  },

  getCategories: async () => {
    await new Promise((r) => setTimeout(r, 200));
    return MENU_CATEGORIES;
  },

  getFeaturedItems: async (): Promise<MenuItemBO[]> => {
    await new Promise((r) => setTimeout(r, 300));
    return getFeaturedItems();
  },

  getItemsByCategory: async (categoryId: string): Promise<MenuItemBO[]> => {
    await new Promise((r) => setTimeout(r, 200));
    return getItemsByCategory(categoryId);
  },

  getItemById: async (id: string): Promise<MenuItemBO | null> => {
    await new Promise((r) => setTimeout(r, 150));
    return getItemById(id) ?? null;
  },

  addMenuItem: async (data: MenuItemInput): Promise<MenuItemBO> => {
    await new Promise((r) => setTimeout(r, 400));
    const newItem: MenuItemBO = {
      id: `item-${Date.now()}`,
      name: data.name.trim(),
      description: data.description.trim(),
      category: data.category,
      image: data.image?.trim() || PLACEHOLDER_IMAGE,
      price: Number(data.price) || 0,
      isVeg: true,
      isBestseller: false,
      isSpecial: false,
      isAvailable: data.isAvailable ?? true,
      preparationTime: undefined,
      tags: undefined,
    };
    _menuItems = [..._menuItems, newItem];
    return newItem;
  },

  updateMenuItem: async (
    id: string,
    data: Partial<MenuItemInput>,
  ): Promise<MenuItemBO> => {
    await new Promise((r) => setTimeout(r, 400));
    const patch: Partial<MenuItemBO> = {
      name: data.name?.trim() || undefined,
      description: data.description?.trim() || undefined,
      category: data.category,
      price: data.price !== undefined ? Number(data.price) : undefined,
      image:
        data.image !== undefined
          ? data.image.trim() || PLACEHOLDER_IMAGE
          : undefined,
      isAvailable: data.isAvailable,
    };
    _menuItems = _menuItems.map((m) => (m.id === id ? { ...m, ...patch } : m));
    const updated = _menuItems.find((m) => m.id === id);
    if (!updated) throw new Error('Menu item not found');
    return updated;
  },

  deleteMenuItem: async (id: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 400));
    _menuItems = _menuItems.filter((m) => m.id !== id);
  },
};