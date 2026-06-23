import { Client, Databases, ID, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  DEFAULT_USERS,
  SEED_SALES_REPORTS,
  SEED_DAMAGE_REPORTS,
  SEED_COLLECTION_REPORTS,
  SEED_PACKING_LOGS,
  SEED_RETURNS,
  SEED_MILEAGE,
  SEED_DRIVER_COLLECTIONS
} from '../src/mockData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || 'distroflow_db';

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error("Missing required environment variables for Appwrite Server SDK.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

// Helper to strip the 'id' field and stringify complex objects
function processData(item: any): any {
  const { id, ...rest } = item;
  const processed: any = {};
  
  for (const [key, value] of Object.entries(rest)) {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      processed[key] = JSON.stringify(value);
    } else {
      processed[key] = value;
    }
  }
  return processed;
}

async function syncCollection(collectionId: string, data: any[]) {
  console.log(`Syncing ${data.length} items to ${collectionId}...`);
  for (const item of data) {
    try {
      // Check if document already exists using custom ID
      const docId = item.id || ID.unique();
      let exists = false;
      
      if (item.id) {
         try {
            await databases.getDocument(DATABASE_ID, collectionId, docId);
            exists = true;
         } catch (e: any) {
            if (e.code !== 404) throw e;
         }
      }

      if (exists) {
         console.log(`  Skipping ${docId} in ${collectionId} (already exists)`);
         continue;
      }

      await databases.createDocument(
        DATABASE_ID,
        collectionId,
        docId,
        processData(item)
      );
      console.log(`  Inserted ${docId} into ${collectionId}`);
    } catch (error: any) {
      console.error(`  Failed to insert into ${collectionId}:`, error.message);
    }
  }
}

async function runSync() {
  try {
    // team_members mapping for defaults
    const membersData = DEFAULT_USERS.map(u => ({
      id: u.id,
      userId: u.userId || u.id,
      username: u.userId || u.id,
      name: u.name,
      password: u.password || 'password123',
      role: u.role,
      active: true,
      detail: u.detail || '',
      avatar: u.avatar || '',
      createdAt: new Date().toISOString()
    }));

    await syncCollection('team_members', membersData);
    await syncCollection('sales_reports', SEED_SALES_REPORTS);
    await syncCollection('damage_reports', SEED_DAMAGE_REPORTS);
    await syncCollection('collection_reports', SEED_COLLECTION_REPORTS);
    await syncCollection('packing_logs', SEED_PACKING_LOGS);
    await syncCollection('return_reports', SEED_RETURNS);
    await syncCollection('mileage_reports', SEED_MILEAGE);
    await syncCollection('market_collections', SEED_DRIVER_COLLECTIONS);
    
    console.log("Migration complete!");
  } catch (err) {
    console.error("Sync failed:", err);
  }
}

runSync();
