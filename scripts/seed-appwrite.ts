import { Client, Databases, ID, Query } from 'node-appwrite';
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

async function seedAdmin() {
  try {
    const existing = await databases.listDocuments(DATABASE_ID, 'team_members', [
      Query.equal('username', 'admin')
    ]);

    if (existing.total > 0) {
      console.log('Admin user already exists. Skipping seed.');
      return;
    }

    console.log('Seeding admin user...');
    await databases.createDocument(DATABASE_ID, 'team_members', ID.unique(), {
      userId: 'admin_001',
      username: 'admin',
      name: 'System Administrator',
      password: 'admin123',
      role: 'System Admin',
      active: true,
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
      createdAt: new Date().toISOString()
    });

    console.log('Seeding sample team members...');
    await databases.createDocument(DATABASE_ID, 'team_members', ID.unique(), {
      userId: 'sales_001',
      username: 'sales1',
      name: 'John Sales',
      password: 'password123',
      role: 'Salesman',
      active: true,
      detail: 'Beat 1',
      avatar: 'https://ui-avatars.com/api/?name=John+Sales',
      createdAt: new Date().toISOString()
    });

    console.log('Seeding sample sales report...');
    await databases.createDocument(DATABASE_ID, 'sales_reports', ID.unique(), {
      date: new Date().toISOString().split('T')[0],
      salesmanId: 'sales_001',
      salesmanName: 'John Sales',
      totalSales: 45000.50,
      beatName: 'Beat 1',
      status: 'Pending',
      remarks: 'Sample initial seed data',
      timestamp: new Date().toISOString()
    });

    console.log('Seeding sample packing log...');
    await databases.createDocument(DATABASE_ID, 'packing_logs', ID.unique(), {
      date: new Date().toISOString().split('T')[0],
      memberId: 'pack_001',
      memberName: 'Sarah Packer',
      station: 1,
      productsPacked: 1200,
      status: 'Checked Out',
      efficiency: 95.5
    });

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

seedAdmin().catch(console.error);
