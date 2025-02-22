/**
 * Browser storage utilities for persisting data
 */

import Fuse from 'fuse.js';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Type definition for a memo
interface Memo {
  memoId: string;
  content: string;
  name: string;
}

const MEMOS_KEY = 'memos';

/**
 * Save memo to localStorage
 */
export const saveMemo = (memo: Memo): void => {
  if (!isBrowser) return;
  try {
    const memos = getMemos();
    const updatedMemos = [...memos.filter(m => m.memoId !== memo.memoId), memo];
    localStorage.setItem(MEMOS_KEY, JSON.stringify(updatedMemos));
  } catch (err) {
    console.error('Error saving memo to localStorage:', err);
  }
};

/**
 * Get all memos from localStorage
 */
export const getMemos = (): Memo[] => {
  if (!isBrowser) return [];
  try {
    const memos = localStorage.getItem(MEMOS_KEY);
    return memos ? JSON.parse(memos) : [];
  } catch (err) {
    console.error('Error reading memos from localStorage:', err);
    return [];
  }
};

/**
 * Get a single memo by ID
 */
export const getMemoById = (memoId: string): Memo | null => {
  if (!isBrowser) return null;
  try {
    const memos = getMemos();
    return memos.find(memo => memo.memoId === memoId) || null;
  } catch (err) {
    console.error('Error reading memo from localStorage:', err);
    return null;
  }
};

/**
 * Remove memo from localStorage
 */
export const removeMemo = (memoId: string): void => {
  if (!isBrowser) return;
  try {
    const memos = getMemos();
    const updatedMemos = memos.filter(memo => memo.memoId !== memoId);
    localStorage.setItem(MEMOS_KEY, JSON.stringify(updatedMemos));
  } catch (err) {
    console.error('Error removing memo from localStorage:', err);
  }
};

/**
 * Clear all memos from localStorage
 */
export const clearMemos = (): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(MEMOS_KEY, JSON.stringify([]));
  } catch (err) {
    console.error('Error clearing memos from localStorage:', err);
  }
};

/**
 * Search for memos using keywords
 * Uses Fuse.js for fuzzy searching with configurable options
 */
export const searchMemos = (keywords: string): Memo[] => {
  if (!isBrowser) return [];
  
  try {
    const memos = getMemos();

    // Configure Fuse options for better matching
    const fuseOptions = {
      keys: ['content', 'name'], // Prioritize content and name search, remove memoId
      includeScore: true,
      threshold: 0.4,
      distance: 100,
      minMatchCharLength: 2,
      // Add weights to prioritize content matches
      weights: {
        content: 2,
        name: 1
      }
    };

    // Create Fuse instance
    const fuse = new Fuse(memos, fuseOptions);

    // Perform fuzzy search
    const searchResults = fuse.search(keywords);

    // Return results without scores
    return searchResults.map(result => result.item);

  } catch (err) {
    console.error('Error searching memos:', err);
    return [];
  }
};
