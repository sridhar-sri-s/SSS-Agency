/// <reference types="vite/client" />
import { Client, Databases, Storage, Account, ID, Query } from 'appwrite';
import type { Models } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint) {
  throw new Error("Missing VITE_APPWRITE_ENDPOINT");
}

if (!projectId) {
  throw new Error("Missing VITE_APPWRITE_PROJECT_ID");
}

console.log("Appwrite Endpoint:", endpoint);
console.log("Appwrite Project ID:", projectId);

const client = new Client();
client
  .setEndpoint(endpoint)
  .setProject(projectId);

export const databases = new Databases(client);
export const storage = new Storage(client);

// These must be provided by environment variables
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

if (!DATABASE_ID) {
  console.warn("Warning: Missing VITE_APPWRITE_DATABASE_ID. Database calls will fail if an ID is not provided.");
}

// Collection IDs — set these to match your Appwrite Console collection IDs
export const COLLECTIONS = {
  TEAM_MEMBERS: import.meta.env.VITE_COLLECTION_TEAM_MEMBERS || 'team_members',
  SALES_REPORTS: import.meta.env.VITE_COLLECTION_SALES_REPORTS || 'sales_reports',
  DAMAGE_REPORTS: import.meta.env.VITE_COLLECTION_DAMAGE_REPORTS || 'damage_reports',
  COLLECTION_REPORTS: import.meta.env.VITE_COLLECTION_COLLECTION_REPORTS || 'collection_reports',
  PACKING_LOGS: import.meta.env.VITE_COLLECTION_PACKING_LOGS || 'packing_logs',
  RETURN_REPORTS: import.meta.env.VITE_COLLECTION_RETURN_REPORTS || 'return_reports',
  MILEAGE_REPORTS: import.meta.env.VITE_COLLECTION_MILEAGE_REPORTS || 'mileage_reports',
  MARKET_COLLECTIONS: import.meta.env.VITE_COLLECTION_MARKET_COLLECTIONS || 'market_collections',
};

export { ID, Query };
export default client;
