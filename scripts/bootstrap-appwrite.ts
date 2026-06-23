import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
let DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || 'distroflow_db';

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error("Missing required environment variables for Appwrite Server SDK.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function createDatabase() {
  try {
    await databases.get(DATABASE_ID);
    console.log(`Database ${DATABASE_ID} already exists.`);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`Database ${DATABASE_ID} not found. Creating...`);
      try {
        await databases.create(DATABASE_ID, 'DistroFlow Pro DB');
        console.log(`Database created: ${DATABASE_ID}`);
      } catch (createError: any) {
        if (createError.code === 409) {
           console.log(`Database ${DATABASE_ID} already exists (race condition).`);
        } else {
           throw createError;
        }
      }
    } else {
      throw error;
    }
  }
}

async function createCollection(collectionId: string, name: string) {
  try {
    await databases.getCollection(DATABASE_ID, collectionId);
    console.log(`Collection ${collectionId} already exists.`);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`Creating collection ${collectionId}...`);
      await databases.createCollection(
        DATABASE_ID,
        collectionId,
        name,
        [
          Permission.read(Role.any()),
          Permission.write(Role.any()),
        ]
      );
      console.log(`Collection created: ${collectionId}`);
    } else {
      throw error;
    }
  }
}

async function createStringAttr(collectionId: string, key: string, size: number, required: boolean, array: boolean = false) {
  try {
    await databases.createStringAttribute(DATABASE_ID, collectionId, key, size, required, undefined, array);
    console.log(`Created string attribute: ${collectionId}.${key}`);
  } catch (error: any) {
    if (error.code !== 409) console.error(`Error creating ${key} in ${collectionId}:`, error.message);
  }
}

async function createFloatAttr(collectionId: string, key: string, required: boolean, array: boolean = false) {
  try {
    await databases.createFloatAttribute(DATABASE_ID, collectionId, key, required, undefined, undefined, undefined, array);
    console.log(`Created float attribute: ${collectionId}.${key}`);
  } catch (error: any) {
    if (error.code !== 409) console.error(`Error creating ${key} in ${collectionId}:`, error.message);
  }
}

async function createIntegerAttr(collectionId: string, key: string, required: boolean, array: boolean = false) {
  try {
    await databases.createIntegerAttribute(DATABASE_ID, collectionId, key, required, undefined, undefined, undefined, array);
    console.log(`Created integer attribute: ${collectionId}.${key}`);
  } catch (error: any) {
    if (error.code !== 409) console.error(`Error creating ${key} in ${collectionId}:`, error.message);
  }
}

async function createBooleanAttr(collectionId: string, key: string, required: boolean, defaultValue: boolean) {
  try {
    await databases.createBooleanAttribute(DATABASE_ID, collectionId, key, required, defaultValue);
    console.log(`Created boolean attribute: ${collectionId}.${key}`);
  } catch (error: any) {
    if (error.code !== 409) console.error(`Error creating ${key} in ${collectionId}:`, error.message);
  }
}

async function createDatetimeAttr(collectionId: string, key: string, required: boolean) {
  try {
    await databases.createDatetimeAttribute(DATABASE_ID, collectionId, key, required);
    console.log(`Created datetime attribute: ${collectionId}.${key}`);
  } catch (error: any) {
    if (error.code !== 409) console.error(`Error creating ${key} in ${collectionId}:`, error.message);
  }
}

async function bootstrap() {
  console.log("Starting Appwrite Bootstrap...");
  await createDatabase();

  // 1. team_members
  await createCollection('team_members', 'Team Members');
  await createStringAttr('team_members', 'userId', 255, false);
  await createStringAttr('team_members', 'username', 255, false);
  await createStringAttr('team_members', 'name', 255, false);
  await createStringAttr('team_members', 'password', 255, false);
  await createStringAttr('team_members', 'role', 255, true);
  await createBooleanAttr('team_members', 'active', false, true);
  await createStringAttr('team_members', 'detail', 255, false);
  await createStringAttr('team_members', 'avatar', 2000, false);
  await createDatetimeAttr('team_members', 'createdAt', false);

  // 2. sales_reports
  await createCollection('sales_reports', 'Sales Reports');
  await createStringAttr('sales_reports', 'date', 255, true);
  await createStringAttr('sales_reports', 'salesmanId', 255, true);
  await createStringAttr('sales_reports', 'salesmanName', 255, true);
  await createFloatAttr('sales_reports', 'totalSales', true);
  await createStringAttr('sales_reports', 'beatName', 255, true);
  await createStringAttr('sales_reports', 'status', 50, true);
  await createStringAttr('sales_reports', 'remarks', 2000, false);
  await createStringAttr('sales_reports', 'timestamp', 255, false);
  await createStringAttr('sales_reports', 'images', 2000, false, true); // array

  // 3. damage_reports
  await createCollection('damage_reports', 'Damage Reports');
  await createStringAttr('damage_reports', 'date', 255, true);
  await createStringAttr('damage_reports', 'salesmanId', 255, true);
  await createStringAttr('damage_reports', 'salesmanName', 255, true);
  await createStringAttr('damage_reports', 'shopNo', 255, true);
  await createStringAttr('damage_reports', 'shopName', 255, true);
  await createStringAttr('damage_reports', 'items', 10000, false); // json array
  await createStringAttr('damage_reports', 'status', 50, true);
  await createStringAttr('damage_reports', 'remarks', 2000, false);
  await createStringAttr('damage_reports', 'images', 2000, false, true);

  // 4. collection_reports
  await createCollection('collection_reports', 'Collection Reports');
  await createStringAttr('collection_reports', 'date', 255, true);
  await createStringAttr('collection_reports', 'salesmanId', 255, true);
  await createStringAttr('collection_reports', 'salesmanName', 255, true);
  await createStringAttr('collection_reports', 'beatName', 255, true);
  await createFloatAttr('collection_reports', 'collectionAmount', true);
  await createStringAttr('collection_reports', 'status', 50, true);
  await createStringAttr('collection_reports', 'remarks', 2000, false);
  await createStringAttr('collection_reports', 'images', 2000, false, true);

  // 5. packing_logs
  await createCollection('packing_logs', 'Packing Logs');
  await createStringAttr('packing_logs', 'date', 255, true);
  await createStringAttr('packing_logs', 'memberId', 255, true);
  await createStringAttr('packing_logs', 'memberName', 255, true);
  await createIntegerAttr('packing_logs', 'station', true);
  await createIntegerAttr('packing_logs', 'productsPacked', true);
  await createStringAttr('packing_logs', 'lunchStart', 255, false);
  await createStringAttr('packing_logs', 'lunchEnd', 255, false);
  await createStringAttr('packing_logs', 'checkoutTime', 255, false);
  await createStringAttr('packing_logs', 'status', 50, true);
  await createFloatAttr('packing_logs', 'efficiency', true);
  await createStringAttr('packing_logs', 'images', 2000, false, true);

  // 6. return_reports
  await createCollection('return_reports', 'Return Reports');
  await createStringAttr('return_reports', 'date', 255, true);
  await createStringAttr('return_reports', 'driverId', 255, true);
  await createStringAttr('return_reports', 'driverName', 255, true);
  await createStringAttr('return_reports', 'shopNo', 255, true);
  await createStringAttr('return_reports', 'shopName', 255, true);
  await createStringAttr('return_reports', 'items', 10000, false);
  await createStringAttr('return_reports', 'productName', 255, false);
  await createIntegerAttr('return_reports', 'quantity', false);
  await createFloatAttr('return_reports', 'mrp', false);
  await createStringAttr('return_reports', 'status', 50, true);
  await createStringAttr('return_reports', 'remarks', 2000, false);
  await createStringAttr('return_reports', 'images', 2000, false, true);

  // 7. mileage_reports
  await createCollection('mileage_reports', 'Mileage Reports');
  await createStringAttr('mileage_reports', 'date', 255, true);
  await createStringAttr('mileage_reports', 'driverId', 255, true);
  await createStringAttr('mileage_reports', 'driverName', 255, true);
  await createStringAttr('mileage_reports', 'routeId', 255, true);
  await createFloatAttr('mileage_reports', 'startOdo', true);
  await createFloatAttr('mileage_reports', 'endOdo', false);
  await createFloatAttr('mileage_reports', 'fuelExpenses', false);
  await createStringAttr('mileage_reports', 'status', 50, true);
  await createStringAttr('mileage_reports', 'remarks', 2000, false);
  await createStringAttr('mileage_reports', 'images', 2000, false, true);

  // 8. market_collections
  await createCollection('market_collections', 'Market Collections');
  await createStringAttr('market_collections', 'date', 255, true);
  await createStringAttr('market_collections', 'driverId', 255, true);
  await createStringAttr('market_collections', 'driverName', 255, true);
  await createStringAttr('market_collections', 'type', 50, true);
  await createFloatAttr('market_collections', 'amount', true);
  await createStringAttr('market_collections', 'shopNo', 255, true);
  await createStringAttr('market_collections', 'shopName', 255, true);
  await createStringAttr('market_collections', 'referenceNo', 255, false);
  await createStringAttr('market_collections', 'chequeDate', 255, false);
  await createStringAttr('market_collections', 'status', 50, true);
  await createStringAttr('market_collections', 'remarks', 2000, false);
  await createStringAttr('market_collections', 'images', 2000, false, true);

  console.log("Bootstrap complete. Waiting 2 seconds for attributes to propagate...");
  await sleep(2000);
}

bootstrap().catch(console.error);
