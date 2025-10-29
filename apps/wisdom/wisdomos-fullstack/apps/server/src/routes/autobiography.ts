import { Router } from "express";
import { prisma } from "../prisma.js";
import { AuthRequest } from "../auth.js";
import { z } from "zod";

const router = Router();

const CreateAutobiographySchema = z.object({
  year: z.number().int().min(1900).max(2100),
  title: z.string().optional(),
  narrative: z.string().optional(),
  earliest: z.string().optional(),
  insight: z.string().optional(),
  commitment: z.string().optional(),
  lifeAreas: z.array(z.number()).optional(),
  tags: z.array(z.string()).optional()
});

const UpdateAutobiographySchema = CreateAutobiographySchema.omit({ year: true }).partial();

// Get all entries for user
router.get("/", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const entries = await prisma.autobiographyEntry.findMany({
      where: { userId },
      orderBy: { year: "desc" }
    });
    res.json(entries);
  } catch (error) {
    console.error("Error fetching autobiography entries:", error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

// Get entries by year range
router.get("/range/:startYear/:endYear", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const startYear = parseInt(req.params.startYear);
    const endYear = parseInt(req.params.endYear);
    
    const entries = await prisma.autobiographyEntry.findMany({
      where: {
        userId,
        year: { gte: startYear, lte: endYear }
      },
      orderBy: { year: "asc" }
    });
    res.json(entries);
  } catch (error) {
    console.error("Error fetching autobiography range:", error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

// Get single entry by year
router.get("/:year", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const year = parseInt(req.params.year);
    
    const entry = await prisma.autobiographyEntry.findUnique({
      where: {
        userId_year: { userId, year }
      }
    });
    
    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }
    
    res.json(entry);
  } catch (error) {
    console.error("Error fetching autobiography entry:", error);
    res.status(500).json({ error: "Failed to fetch entry" });
  }
});

// Create or update entry
router.post("/", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const data = CreateAutobiographySchema.parse(req.body);
    
    const entry = await prisma.autobiographyEntry.upsert({
      where: {
        userId_year: { userId, year: data.year }
      },
      update: data,
      create: { ...data, userId }
    });
    
    res.status(201).json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Error creating autobiography entry:", error);
    res.status(500).json({ error: "Failed to create entry" });
  }
});

// Update entry by year
router.put("/:year", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const year = parseInt(req.params.year);
    const data = UpdateAutobiographySchema.parse(req.body);
    
    const entry = await prisma.autobiographyEntry.update({
      where: {
        userId_year: { userId, year }
      },
      data
    });
    
    res.json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Error updating autobiography entry:", error);
    res.status(500).json({ error: "Failed to update entry" });
  }
});

// Delete entry
router.delete("/:year", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const year = parseInt(req.params.year);
    
    await prisma.autobiographyEntry.delete({
      where: {
        userId_year: { userId, year }
      }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting autobiography entry:", error);
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

export default router;