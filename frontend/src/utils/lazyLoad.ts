import { lazy, type ComponentType } from 'react';
import { log } from '@/services/logger';

export function lazyLoad<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
  retries = 2,
) {
  let attempts = 0;

  const load = (): Promise<{ default: T }> =>
    factory().catch((error) => {
      if (attempts < retries) {
        attempts += 1;
        log.warn('lazyLoad', `retrying chunk import (${attempts}/${retries})`, error);
        return load();
      }
      throw error;
    });

  return lazy(load);
}