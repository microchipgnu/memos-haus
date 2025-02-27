/**
 * Storage utilities for persisting data
 */

import Fuse from 'fuse.js';

// Generic type for stored items
interface StorageItem {
  id: string;
  [key: string]: string | number | boolean | object;
}

// Storage adapter interface
interface StorageAdapter<T extends StorageItem> {
  save(item: T): void;
  getAll(): T[];
  getById(id: string): T | null; 
  remove(id: string): void;
  clear(): void;
}

// Base storage implementation
class BaseStorageAdapter<T extends StorageItem> implements StorageAdapter<T> {
  protected items: T[] = [];

  constructor(initialData: T[] = []) {
    this.items = initialData;
  }

  save(item: T): void {
    this.items = [...this.items.filter(i => i.id !== item.id), item];
  }

  getAll(): T[] {
    return this.items;
  }

  getById(id: string): T | null {
    return this.items.find(item => item.id === id) || null;
  }

  remove(id: string): void {
    this.items = this.items.filter(item => item.id !== id);
  }

  clear(): void {
    this.items = [];
  }
}

// Browser storage implementation
class BrowserStorageAdapter<T extends StorageItem> extends BaseStorageAdapter<T> {
  private key: string;

  constructor(storageKey: string, initialData: T[] = []) {
    super(initialData);
    this.key = storageKey;
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.key);
      if (stored) {
        this.items = JSON.parse(stored);
      }
    } catch (err) {
      console.error(`Error loading from localStorage:`, err);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.items));
    } catch (err) {
      console.error(`Error saving to localStorage:`, err);
    }
  }

  save(item: T): void {
    super.save(item);
    this.saveToStorage();
  }

  remove(id: string): void {
    super.remove(id);
    this.saveToStorage();
  }

  clear(): void {
    super.clear();
    this.saveToStorage();
  }
}

// Memo specific interface
export interface Memo extends StorageItem {
  content: string;
  name: string;
}

// Create storage factory
const createStorage = <T extends StorageItem>(key: string, initialData: T[] = []): StorageAdapter<T> => {
  const isBrowser = typeof window !== 'undefined';
  return isBrowser 
    ? new BrowserStorageAdapter<T>(key, initialData)
    : new BaseStorageAdapter<T>(initialData);
};

// Create memo storage instance
export const createMemoStorage = (initialData: Memo[] = []) => createStorage<Memo>('memos', initialData);

/**
 * Save memo to storage
 */
export const saveMemo = (memo: Omit<Memo, 'id'> & { memoId: string }, storage = createMemoStorage()): void => {
  const { memoId, content, name } = memo;
  storage.save({ id: memoId, content: String(content), name: String(name) });
};

/**
 * Get all memos from storage
 */
export const getMemos = (storage = createMemoStorage()): Memo[] => {
  return storage.getAll();
};

/**
 * Get a single memo by ID
 */
export const getMemoById = (memoId: string, storage = createMemoStorage()): Memo | null => {
  return storage.getById(memoId);
};

/**
 * Remove memo from storage
 */
export const removeMemo = (memoId: string, storage = createMemoStorage()): void => {
  storage.remove(memoId);
};

/**
 * Clear all memos from storage
 */
export const clearMemos = (storage = createMemoStorage()): void => {
  storage.clear();
};

/**
 * Search for memos using keywords
 * Uses Fuse.js for fuzzy searching with configurable options
 */
export const searchMemos = (keywords: string, storage = createMemoStorage()): Memo[] => {
  try {
    const memos = storage.getAll();

    const fuseOptions = {
      keys: ['content', 'name'],
      includeScore: true,
      threshold: 0.4,
      distance: 100,
      minMatchCharLength: 2,
      weights: {
        content: 2,
        name: 1
      }
    };

    const fuse = new Fuse(memos, fuseOptions);
    const searchResults = fuse.search(keywords);

    return searchResults.map(result => result.item);

  } catch (err) {
    console.error('Error searching memos:', err);
    return [];
  }
};