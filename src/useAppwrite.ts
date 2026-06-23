import { useState, useEffect, useCallback } from 'react';
import { databases, DATABASE_ID, ID, Query } from './lib/appwrite';
import type { Models } from 'appwrite';

/**
 * Maps an Appwrite document to our app's type format.
 * Appwrite uses $id, $createdAt, etc. We map $id → id and pass through everything else.
 */
function mapDocument<T>(doc: Models.Document): T {
  const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...rest } = doc;
  
  const parsedRest: any = {};
  for (const [key, value] of Object.entries(rest)) {
    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
      try {
        parsedRest[key] = JSON.parse(value);
      } catch (e) {
        parsedRest[key] = value;
      }
    } else {
      parsedRest[key] = value;
    }
  }

  return {
    id: $id,
    createdAt: $createdAt,
    ...parsedRest,
  } as unknown as T;
}

/**
 * Strips the 'id' and 'createdAt' fields before sending to Appwrite,
 * since Appwrite manages those internally as $id and $createdAt.
 */
function stripManagedFields(data: Record<string, any>): Record<string, any> {
  const { id, createdAt, ...rest } = data;
  return rest;
}

/**
 * Generic hook for Appwrite Database CRUD operations.
 * Drop-in replacement for the old useApi hook.
 * 
 * @param collectionId - The Appwrite collection ID
 * @param queries - Optional array of Query filters for listDocuments
 */
export function useAppwrite<T extends { id: string }>(
  collectionId: string,
  queries: string[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        collectionId,
        [
          ...queries,
          Query.limit(500),
          Query.orderDesc('$createdAt'),
        ]
      );
      setData(response.documents.map(doc => mapDocument<T>(doc)));
    } catch (error) {
      console.error(`Failed to fetch from collection ${collectionId}:`, error);
    } finally {
      setLoading(false);
    }
  }, [collectionId, JSON.stringify(queries)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const add = async (item: T) => {
    try {
      // Optimistic update
      setData(prev => [item, ...prev]);
      
      const cleanData = stripManagedFields(item as any);
      
      // Handle complex objects: stringify arrays/objects that Appwrite can't store natively
      const processedData: Record<string, any> = {};
      for (const [key, value] of Object.entries(cleanData)) {
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
          // Stringify arrays of objects (e.g., damage items, return items)
          processedData[key] = JSON.stringify(value);
        } else {
          processedData[key] = value;
        }
      }

      await databases.createDocument(
        DATABASE_ID,
        collectionId,
        ID.unique(),
        processedData
      );
    } catch (error) {
      console.error(`Failed to add to ${collectionId}:`, error);
      // Revert optimistic update on failure
      setData(prev => prev.filter(d => d.id !== item.id));
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      // Optimistic update
      setData(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      
      const cleanUpdates = stripManagedFields(updates as any);
      
      // Process complex objects
      const processedUpdates: Record<string, any> = {};
      for (const [key, value] of Object.entries(cleanUpdates)) {
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
          processedUpdates[key] = JSON.stringify(value);
        } else {
          processedUpdates[key] = value;
        }
      }

      await databases.updateDocument(
        DATABASE_ID,
        collectionId,
        id,
        processedUpdates
      );
    } catch (error) {
      console.error(`Failed to update in ${collectionId}:`, error);
      // Refetch on failure
      fetchData();
    }
  };

  const remove = async (id: string) => {
    try {
      // Optimistic update
      setData(prev => prev.filter(item => item.id !== id));

      await databases.deleteDocument(
        DATABASE_ID,
        collectionId,
        id
      );
    } catch (error) {
      console.error(`Failed to delete from ${collectionId}:`, error);
      fetchData();
    }
  };

  const refetch = () => fetchData();

  return { data, loading, add, update, remove, refetch };
}
