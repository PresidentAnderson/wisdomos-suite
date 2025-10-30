import { Router } from "express";
import { prisma } from "../prisma.js";
import { AuthRequest } from "../auth.js";
import { z } from "zod";

const router = Router();

const CreateContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phoneE164: z.string().optional(),
  hubspotId: z.string().optional(),
  salesforceId: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  lifeAreaLinks: z.array(z.object({
    lifeAreaId: z.number().int().min(1).max(13),
    roleLabel: z.string().optional(),
    frequency: z.string().optional(),
    weight: z.number().min(0).max(1).optional(),
    outcomes: z.string().optional(),
    notes: z.string().optional()
  })).optional()
});

// Get all contacts with their life area links
router.get("/", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const contacts = await prisma.contact.findMany({
      where: { userId },
      include: {
        lifeAreaLinks: {
          include: { lifeArea: true }
        },
        assessments: {
          orderBy: { assessedOn: "desc" },
          take: 1
        }
      },
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" }
      ]
    });
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// Get single contact with full details
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, userId },
      include: {
        lifeAreaLinks: {
          include: { lifeArea: true }
        },
        interactions: {
          orderBy: { occurredAt: "desc" },
          take: 10
        },
        assessments: {
          include: { lifeArea: true },
          orderBy: { assessedOn: "desc" }
        }
      }
    });
    
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    
    res.json(contact);
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({ error: "Failed to fetch contact" });
  }
});

// Create contact with life area links
router.post("/", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const { lifeAreaLinks, ...contactData } = CreateContactSchema.parse(req.body);
    
    // Create contact
    const contact = await prisma.contact.create({
      data: { ...contactData, userId }
    });
    
    // Create life area links if provided
    if (lifeAreaLinks && lifeAreaLinks.length > 0) {
      await prisma.contactLifeAreaLink.createMany({
        data: lifeAreaLinks.map(link => ({
          ...link,
          userId,
          contactId: contact.id
        }))
      });
    }
    
    // Fetch complete contact with links
    const completeContact = await prisma.contact.findUnique({
      where: { id: contact.id },
      include: {
        lifeAreaLinks: {
          include: { lifeArea: true }
        }
      }
    });
    
    res.status(201).json(completeContact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Error creating contact:", error);
    res.status(500).json({ error: "Failed to create contact" });
  }
});

// Update contact
router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const { lifeAreaLinks, ...contactData } = CreateContactSchema.partial().parse(req.body);
    
    // Update contact
    const contact = await prisma.contact.updateMany({
      where: { id: req.params.id, userId },
      data: contactData
    });
    
    if (contact.count === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }
    
    // Update life area links if provided
    if (lifeAreaLinks !== undefined) {
      // Delete existing links
      await prisma.contactLifeAreaLink.deleteMany({
        where: { contactId: req.params.id }
      });
      
      // Create new links
      if (lifeAreaLinks.length > 0) {
        await prisma.contactLifeAreaLink.createMany({
          data: lifeAreaLinks.map(link => ({
            ...link,
            userId,
            contactId: req.params.id
          }))
        });
      }
    }
    
    // Fetch updated contact
    const updated = await prisma.contact.findFirst({
      where: { id: req.params.id },
      include: {
        lifeAreaLinks: {
          include: { lifeArea: true }
        }
      }
    });
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Error updating contact:", error);
    res.status(500).json({ error: "Failed to update contact" });
  }
});

// Add/update life area link for contact
router.post("/:id/life-areas", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const contactId = req.params.id;
    
    const linkData = z.object({
      lifeAreaId: z.number().int().min(1).max(13),
      roleLabel: z.string().optional(),
      frequency: z.string().optional(),
      weight: z.number().min(0).max(1).optional(),
      outcomes: z.string().optional(),
      notes: z.string().optional()
    }).parse(req.body);
    
    // Verify contact belongs to user
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId }
    });
    
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    
    // Upsert link
    const link = await prisma.contactLifeAreaLink.upsert({
      where: {
        contactId_lifeAreaId: {
          contactId,
          lifeAreaId: linkData.lifeAreaId
        }
      },
      update: linkData,
      create: {
        ...linkData,
        userId,
        contactId
      },
      include: { lifeArea: true }
    });
    
    res.json(link);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Error updating life area link:", error);
    res.status(500).json({ error: "Failed to update link" });
  }
});

// Delete contact
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    
    const deleted = await prisma.contact.deleteMany({
      where: { id: req.params.id, userId }
    });
    
    if (deleted.count === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

export default router;