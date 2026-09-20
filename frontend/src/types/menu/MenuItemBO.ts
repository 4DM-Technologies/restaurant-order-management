export interface MenuItemVariantBO {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemAddonBO {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemBO {
  id: string;
  name: string;
  description: string;
  category: string;
  subCategory?: string;
  image: string;
  price: number;           // base price
  variants?: MenuItemVariantBO[];
  addons?: MenuItemAddonBO[];
  isVeg: boolean;
  isBestseller?: boolean;
  isSpecial?: boolean;
  isAvailable: boolean;
  preparationTime?: number; // minutes
  tags?: string[];
}
