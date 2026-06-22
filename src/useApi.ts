import { useState, useEffect } from 'react';

export function useApi<T extends { id: string }>(endpoint: string, initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(endpoint)
      .then(r => r.json())
      .then(json => {
        if (Array.isArray(json)) setData(json);
        setLoading(false);
      })
      .catch(e => {
        console.error("Failed to fetch", endpoint, e);
        setLoading(false);
      });
  }, [endpoint]);

  const add = async (item: T) => {
    try {
      // optimistic update
      setData(prev => [item, ...prev]);
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
    } catch(e) {
      console.error(e);
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      setData(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      await fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch(e) { console.error(e); }
  };

  const remove = async (id: string) => {
    try {
      setData(prev => prev.filter(item => item.id !== id));
      await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
    } catch(e) { console.error(e); }
  };

  const setAll = (newData: T[]) => setData(newData); // Fallback for bulk ops if needed

  return { data, loading, add, update, remove, setAll };
}
