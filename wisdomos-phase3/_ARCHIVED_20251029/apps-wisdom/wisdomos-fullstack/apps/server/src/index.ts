import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./env.js";
import { prisma } from "./prisma.js";
import { requireAuth, signToken } from "./auth.js";
import { z } from "zod";

// Import routes
import contributionsRouter from "./routes/contributions.js";
import autobiographyRouter from "./routes/autobiography.js";
import fulfillmentRouter from "./routes/fulfillment.js";
import assessmentsRouter from "./routes/assessments.js";
import contactsRouter from "./routes/contacts.js";
import interactionsRouter from "./routes/interactions.js";
import { getHubSpotClient } from "./integrations/hubspot.js";

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check
app.get("/health", (_, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Auth endpoints
const LoginSchema = z.object({
  email: z.string().email(),
  name: z.string().optional()
});

// Demo login - creates or gets user
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, name } = LoginSchema.parse(req.body);
    
    // Upsert user
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: name || undefined },
      create: { email, name }
    });
    
    // Generate token
    const token = signToken({
      sub: user.id,
      email: user.email,
      name: user.name || undefined
    });
    
    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Verify token endpoint
app.get("/api/auth/me", requireAuth, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub }
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Protected API routes
app.use("/api/contributions", requireAuth, contributionsRouter);
app.use("/api/autobiography", requireAuth, autobiographyRouter);
app.use("/api/fulfillment", requireAuth, fulfillmentRouter);
app.use("/api/assessments", requireAuth, assessmentsRouter);
app.use("/api/contacts", requireAuth, contactsRouter);
app.use("/api/interactions", requireAuth, interactionsRouter);

// Boundary audits endpoint
app.get("/api/boundary-audits", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.sub;
    const audits = await prisma.boundaryAudit.findMany({
      where: { userId },
      include: { lifeArea: true },
      orderBy: { timestamp: "desc" },
      take: 50
    });
    res.json(audits);
  } catch (error) {
    console.error("Error fetching boundary audits:", error);
    res.status(500).json({ error: "Failed to fetch audits" });
  }
});

app.post("/api/boundary-audits", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.sub;
    const { lifeAreaId, incident, response, learning } = req.body;
    
    const audit = await prisma.boundaryAudit.create({
      data: {
        userId,
        lifeAreaId,
        incident,
        response,
        learning
      },
      include: { lifeArea: true }
    });
    
    res.status(201).json(audit);
  } catch (error) {
    console.error("Error creating boundary audit:", error);
    res.status(500).json({ error: "Failed to create audit" });
  }
});

// HubSpot sync endpoints
app.post("/api/hubspot/sync-contacts", requireAuth, async (req: any, res) => {
  try {
    const hubspot = getHubSpotClient();
    if (!hubspot) {
      return res.status(503).json({ error: "HubSpot integration not configured" });
    }
    
    // Run sync in background
    hubspot.syncAllContacts().catch(console.error);
    
    res.json({ message: "Contact sync initiated" });
  } catch (error) {
    console.error("Error initiating HubSpot sync:", error);
    res.status(500).json({ error: "Failed to initiate sync" });
  }
});

app.post("/api/hubspot/sync-contact/:id", requireAuth, async (req: any, res) => {
  try {
    const hubspot = getHubSpotClient();
    if (!hubspot) {
      return res.status(503).json({ error: "HubSpot integration not configured" });
    }
    
    const userId = req.user.sub;
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, userId }
    });
    
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    
    await hubspot.syncContactToHubSpot(req.params.id);
    res.json({ message: "Contact synced successfully" });
  } catch (error) {
    console.error("Error syncing contact to HubSpot:", error);
    res.status(500).json({ error: "Failed to sync contact" });
  }
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 WisdomOS API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});