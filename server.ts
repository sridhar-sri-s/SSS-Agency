import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.js";
import { eq, desc } from "drizzle-orm";
import { 
  teamMembers, salesReports, damageReports, collectionReports, 
  packingLogs, returnReports, mileageReports, marketCollections 
} from "./src/db/schema.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // Helper macro for generic routes
  const setupRoutes = (pathBase: string, tableObj: any) => {
    app.get(pathBase, async (req, res) => {
      try {
        const records = await db.select().from(tableObj);
        res.json(records);
      } catch(err: any) { res.status(500).json({error: err.message}); }
    });
    app.post(pathBase, async (req, res) => {
      try {
        const result = await db.insert(tableObj).values(req.body).returning();
        res.json(result[0] || result);
      } catch(err: any) { res.status(500).json({error: err.message}); }
    });
    app.put(`${pathBase}/:id`, async (req, res) => {
      try {
        const result = await db.update(tableObj).set(req.body).where(eq(tableObj.id, req.params.id as any)).returning();
        res.json(result[0] || result);
      } catch(err: any) { res.status(500).json({error: err.message}); }
    });
    app.delete(`${pathBase}/:id`, async (req, res) => {
      try {
        await db.delete(tableObj).where(eq(tableObj.id, req.params.id as any));
        res.json({ success: true });
      } catch(err: any) { res.status(500).json({error: err.message}); }
    });
  };

  setupRoutes('/api/team', teamMembers);
  setupRoutes('/api/sales', salesReports);
  setupRoutes('/api/damage', damageReports);
  setupRoutes('/api/collection', collectionReports);
  setupRoutes('/api/packing', packingLogs);
  setupRoutes('/api/returns', returnReports);
  setupRoutes('/api/mileage', mileageReports);
  setupRoutes('/api/market', marketCollections);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
