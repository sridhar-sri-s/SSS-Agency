import { Client, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT!)
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || 'distroflow_db';

async function test() {
  try {
    const res = await databases.listDocuments(DATABASE_ID, 'team_members', [
      Query.or([
         Query.equal('username', 'admin'),
         Query.equal('userId', 'admin')
      ])
    ]);
    console.log("Success:", res.documents.length);
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

test();
