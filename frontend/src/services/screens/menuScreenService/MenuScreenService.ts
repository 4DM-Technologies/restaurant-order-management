import type { MenuItemBO } from '@/types/menu/MenuItemBO.ts';
import {
  menuData,
  MENU_CATEGORIES,
  getFeaturedItems,
  getItemsByCategory,
  getItemById,
} from '@/services/screens/menuScreenService/menuData.ts';

export const menuScreenService = {
  getMenu: async (): Promise<MenuItemBO[]> => {
    await new Promise((r) => setTimeout(r, 400));
    return menuData;
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
};
