import type { MenuItemBO } from '@/types/menu/MenuItemBO.ts';
import { MENU_CATEGORIES } from '@/services/screens/menuScreenService/menuData.ts';
import { getImageUrl } from '@/services/uploadImageService.ts';
import { apiClient } from '@/services/apiClient.ts';

export interface MenuItemInput {
  name: string;
  category: string;
  price: number;
  description: string;
  image?: string;
  isAvailable?: boolean;
}

interface ApiMenuItem {
  menu_uuid: string;
  menu_id: number;
  category: string;
  item_name: string;
  item_description: string;
  standard_price: number;
  small_price: number | null;
  large_price: number | null;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
}

const CATEGORY_LABELS = Object.fromEntries(MENU_CATEGORIES.map((c) => [c.id, c.label]));
const CATEGORY_IDS = Object.fromEntries(MENU_CATEGORIES.map((c) => [c.label, c.id]));

function toBO(item: ApiMenuItem): MenuItemBO {
  return {
    id: item.menu_uuid,
    name: item.item_name,
    description: item.item_description?.trim() || '',
    category: CATEGORY_IDS[item.category] ?? item.category,
    image: getImageUrl(item.image_url),
    price: item.standard_price ?? item.small_price ?? item.large_price ?? 0,
    isVeg: true,
    isBestseller: false,
    isSpecial: false,
    isAvailable: item.is_available,
  };
}

function toInput(data: MenuItemInput): Record<string, unknown> {
  return {
    category: CATEGORY_LABELS[data.category] ?? data.category,
    name: data.name.trim(),
    description: data.description.trim(),
    standard_price: Number(data.price) || 0,
    image_url: data.image?.trim() || null,
    is_available: data.isAvailable ?? true,
  };
}

async function fetchAll(): Promise<ApiMenuItem[]> {
  const groups = await apiClient.get<Array<{ category: string; items: ApiMenuItem[] }>>('/menu');
  return groups.flatMap((g) => g.items ?? []);
}

export const menuScreenService = {
  getMenu: async (): Promise<MenuItemBO[]> => {
    const items = await fetchAll();
    return items.map(toBO);
  },

  getCategories: async () => {
    return MENU_CATEGORIES;
  },

  getFeaturedItems: async (): Promise<MenuItemBO[]> => {
    const items = await fetchAll();
    return items.slice(0, 6).map(toBO);
  },

  getItemsByCategory: async (categoryId: string): Promise<MenuItemBO[]> => {
    const label = CATEGORY_LABELS[categoryId] ?? categoryId;
    const items = await fetchAll();
    return items.filter((i) => i.category === label).map(toBO);
  },

  getItemById: async (id: string): Promise<MenuItemBO | null> => {
    const items = await fetchAll();
    const found = items.find((i) => i.menu_uuid === id);
    return found ? toBO(found) : null;
  },

  addMenuItem: async (data: MenuItemInput): Promise<MenuItemBO> => {
    const item = await apiClient.post<ApiMenuItem>('/menu', toInput(data));
    return toBO(item);
  },

  updateMenuItem: async (id: string, data: Partial<MenuItemInput>): Promise<MenuItemBO> => {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.category !== undefined) payload.category = CATEGORY_LABELS[data.category] ?? data.category;
    if (data.description !== undefined) payload.description = data.description.trim();
    if (data.price !== undefined) payload.standard_price = Number(data.price);
    if (data.image !== undefined) payload.image_url = data.image.trim() || null;
    if (data.isAvailable !== undefined) payload.is_available = data.isAvailable;
    const item = await apiClient.patch<ApiMenuItem>(`/menu/${id}`, payload);
    return toBO(item);
  },

  deleteMenuItem: async (id: string): Promise<void> => {
    await apiClient.delete(`/menu/${id}`);
  },
};