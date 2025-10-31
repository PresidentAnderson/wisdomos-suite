import { z } from 'zod';

// Fulfillment Display Schemas
export const RelationshipSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  lifeAreaId: z.string().uuid(),
  name: z.string().min(1).max(100),
  frequency: z.number().int().min(1).max(10).default(5),
  notes: z.string().optional(),
  lastContact: z.date().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
});

export const LifeAreaNodeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phoenixName: z.string().optional(),
  color: z.string(),
  icon: z.string().optional(),
  score: z.number(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  size: z.number().default(100),
  relationships: z.array(RelationshipSchema),
});

export const FulfillmentDisplaySchema = z.object({
  areas: z.array(LifeAreaNodeSchema),
  connections: z.array(z.object({
    fromAreaId: z.string().uuid(),
    toAreaId: z.string().uuid(),
    relationshipIds: z.array(z.string().uuid()),
  })),
});

export const UpdateNodePositionSchema = z.object({
  nodeId: z.string().uuid(),
  nodeType: z.enum(['area', 'relationship']),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const CreateRelationshipSchema = z.object({
  lifeAreaId: z.string().uuid(),
  name: z.string().min(1).max(100),
  frequency: z.number().int().min(1).max(10).default(5),
  notes: z.string().optional(),
});

export const ContactReminderSchema = z.object({
  relationshipId: z.string().uuid(),
  name: z.string(),
  daysSinceLastContact: z.number(),
  frequency: z.number(),
  urgency: z.enum(['low', 'medium', 'high']),
});

export type Relationship = z.infer<typeof RelationshipSchema>;
export type LifeAreaNode = z.infer<typeof LifeAreaNodeSchema>;
export type FulfillmentDisplay = z.infer<typeof FulfillmentDisplaySchema>;
export type UpdateNodePosition = z.infer<typeof UpdateNodePositionSchema>;
export type CreateRelationship = z.infer<typeof CreateRelationshipSchema>;
export type ContactReminder = z.infer<typeof ContactReminderSchema>;