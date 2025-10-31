import { z } from "zod"

// User Types
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  role: z.enum(["USER", "CREATOR", "ADMIN"]),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type User = z.infer<typeof UserSchema>

// Game Types
export const GameSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0, "Price must be positive"),
  category: z.string(),
  ageRange: z.string(),
  coverImage: z.string().url(),
  creatorId: z.string(),
  published: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Game = z.infer<typeof GameSchema>

// Purchase Types
export const PurchaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  gameId: z.string(),
  amount: z.number(),
  stripePaymentId: z.string(),
  createdAt: z.date(),
})

export type Purchase = z.infer<typeof PurchaseSchema>

// Review Types
export const ReviewSchema = z.object({
  id: z.string(),
  userId: z.string(),
  gameId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  createdAt: z.date(),
})

export type Review = z.infer<typeof ReviewSchema>
