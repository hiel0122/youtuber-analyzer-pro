import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface AnalysisHistoryItem {
  id: string;
  title: string;
  url: string;
  createdAt: number;
}

const MAX_ITEMS = 10;

export function useAnalysisHistory() {
  const { user } = useAuth();
  const [items, setItems] = useState<AnalysisHistoryItem[]>([]);

  const getStorageKey = () => {
    return user ? `analysisHistory:v1:${user.id}` : 'analysisHistory:v1:guest';
  };

  useEffect(() => {
    loadItems();
  }, [user]);

  const loadItems = () => {
    try {
      const key = getStorageKey();
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setItems(Array.isArray(parsed) ? parsed : []);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to load analysis history:', error);
      setItems([]);
    }
  };

  const saveItems = (newItems: AnalysisHistoryItem[]) => {
    try {
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(newItems));
      setItems(newItems);
    } catch (error) {
      console.error('Failed to save analysis history:', error);
    }
  };

  const add = (url: string, title = url) => {
    const existingIndex = items.findIndex(item => item.url === url);
    
    let newItems: AnalysisHistoryItem[];
    
    if (existingIndex !== -1) {
      // Move existing item to front
      const existing = items[existingIndex];
      newItems = [
        { ...existing, createdAt: Date.now() },
        ...items.filter((_, i) => i !== existingIndex)
      ];
    } else {
      // Add new item
      const newItem: AnalysisHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        url,
        createdAt: Date.now()
      };
      newItems = [newItem, ...items];
    }

    // Keep only MAX_ITEMS
    if (newItems.length > MAX_ITEMS) {
      newItems = newItems.slice(0, MAX_ITEMS);
    }

    saveItems(newItems);
  };

  const rename = (id: string, title: string) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, title } : item
    );
    saveItems(newItems);
  };

  const remove = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    saveItems(newItems);
  };

  return {
    items,
    add,
    rename,
    remove,
    refresh: loadItems
  };
}

