import { apiClient } from '@/services/apiClient';
import { IMAGE_BASE_URL } from '@/services/config';

const IMAGE_BASE: string = IMAGE_BASE_URL;

export function getImageUrl(value: string | null | undefined): string {
  if (!value) return '';
  if (/^(https?:|data:)/.test(value)) return value;
  if (value.startsWith('/')) return `${IMAGE_BASE}${value}`;
  return value;
}

export async function uploadImage(file: File, itemName: string): Promise<string> {
  const form = new FormData();
  form.append('item_name', itemName);
  form.append('file', file, file.name);
  const data = await apiClient.upload<{ image_url: string }>('/upload/image', form);
  return data.image_url;
}