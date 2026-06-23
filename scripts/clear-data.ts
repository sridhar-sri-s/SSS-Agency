import { Client, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

const OPERATIONAL_COLLECTIONS = [
  'sales_reports',
  'damage_reports',
  'collection_reports',
  'packing_logs',
  'return_reports',
  'mileage_reports',
  'market_collections'
];

async function clearCollection(collectionId: string) {
  try {
    console.log(`Fetching documents for collection: ${collectionId}...`);
    const docs = await databases.listDocuments(DATABASE_ID, collectionId, [
        Query.limit(100)
    ]);
    
    if (docs.documents.length === 0) {
      console.log(`Collection ${collectionId} is already empty.`);
      return;
    }

    console.log(`Deleting ${docs.documents.length} documents from ${collectionId}...`);
    for (const doc of docs.documents) {
      await databases.deleteDocument(DATABASE_ID, collectionId, doc.$id);
    }
    
    // If there are more than 100 docs, recursively call until empty
    if (docs.total > docs.documents.length) {
      await clearCollection(collectionId);
    }
  } catch (err: any) {
    if (err.code === 404) {
      console.log(`Collection ${collectionId} not found, skipping.`);
    } else {
      console.error(`Error clearing ${collectionId}:`, err);
    }
  }
}

async function run() {
  console.log("Starting data wipe...");
  for (const col of OPERATIONAL_COLLECTIONS) {
    await clearCollection(col);
  }
  console.log("Operational data cleared successfully.");
}

run();
