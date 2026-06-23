import { Client, Databases, Query } from 'appwrite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT!)
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

const COLLECTIONS = [
  'team_members',
  'sales_reports',
  'damage_reports',
  'collection_reports',
  'packing_logs',
  'return_reports',
  'mileage_reports',
  'market_collections'
];

async function testAll() {
  const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || 'distroflow_db';
  for (const col of COLLECTIONS) {
    try {
      const res = await databases.listDocuments(DATABASE_ID, col, [
        Query.limit(500),
        Query.orderDesc('$createdAt')
      ]);
      console.log(`Success ${col}: ${res.documents.length}`);
    } catch (err: any) {
      console.error(`Error ${col}:`, err.message);
    }
  }
}

testAll();
