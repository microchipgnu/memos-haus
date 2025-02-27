import { useEffect, useState } from 'react';
import { Memo, getMemos, createMemoStorage, searchMemos } from '@/lib/core/storage';

export function useStorage() {
    const [memos, setMemos] = useState<Memo[]>([]);
    const [storage] = useState(() => createMemoStorage());

    useEffect(() => {
        // Initial load
        const loadMemos = () => {
            setMemos(getMemos());
        };
        
        loadMemos();

        // Listen for storage events from other tabs/windows
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'memos') {
                try {
                    const newMemos = event.newValue ? JSON.parse(event.newValue) : [];
                    setMemos(newMemos);
                } catch (err) {
                    console.error('Error parsing storage update:', err);
                }
            }
        };

        // Subscribe to storage events
        window.addEventListener('storage', handleStorageChange);

        // Create custom event for same-window updates
        window.addEventListener('memosUpdated', loadMemos);

        return () => {
            // Cleanup
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('memosUpdated', loadMemos);
        };
    }, []);

    const saveMemo = (memo: Memo) => {
        storage.save(memo);
        // Dispatch custom event to trigger reload
        window.dispatchEvent(new Event('memosUpdated'));
    };

    const removeMemo = (id: string) => {
        storage.remove(id);
        // Dispatch custom event to trigger reload
        window.dispatchEvent(new Event('memosUpdated'));
    };

    const clearMemos = () => {
        storage.clear();
        setMemos([]);
        // Dispatch custom event to trigger reload
        window.dispatchEvent(new Event('memosUpdated'));
    };

    const search = (keywords: string) => {
        return searchMemos(keywords, storage);
    };

    return {
        memos,
        saveMemo,
        removeMemo,
        clearMemos,
        search
    };
}
