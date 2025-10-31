import { z } from 'zod';

export const DocumentTypeSchema = z.enum([
  'teaching',
  'creative_work',
  'personal_document',
  'photo',
  'video',
  'audio',
  'other'
]);

export const TrusteeAccessLevelSchema = z.enum([
  'view_only',
  'download',
  'manage',
  'full_access'
]);

export const VaultDocumentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: DocumentTypeSchema,
  fileUrl: z.string(),
  encryptedUrl: z.string().optional(),
  fileSize: z.number(),
  mimeType: z.string(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  isEncrypted: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TrusteeAssignmentSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  trusteeUserId: z.string(),
  accessLevel: TrusteeAccessLevelSchema,
  accessKey: z.string().optional(), // Encrypted key for document access
  activationCondition: z.enum(['immediate', 'on_death', 'on_incapacity', 'custom']),
  customCondition: z.string().optional(),
  expiresAt: z.date().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const LegacyVaultSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  documents: z.array(VaultDocumentSchema),
  trustees: z.array(TrusteeAssignmentSchema),
  encryptionKey: z.string(), // Master key for the vault
  backupEmail: z.string().optional(),
  lastAccessedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SuccessionPlanSchema = z.object({
  id: z.string(),
  userId: z.string(),
  vaultId: z.string(),
  instructions: z.string(),
  emergencyContacts: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    email: z.string(),
    phone: z.string().optional(),
  })),
  legalDocuments: z.array(z.object({
    type: z.enum(['will', 'power_of_attorney', 'healthcare_directive', 'other']),
    documentId: z.string(),
    notes: z.string().optional(),
  })).optional(),
  digitalAssets: z.array(z.object({
    platform: z.string(),
    username: z.string().optional(),
    instructions: z.string(),
  })).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ExportBundleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  vaultId: z.string(),
  format: z.enum(['pdf', 'markdown', 'notion', 'json']),
  includeDocuments: z.boolean(),
  includeMetadata: z.boolean(),
  encryptionPassword: z.string().optional(),
  qrVerificationCode: z.string(),
  downloadUrl: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export type DocumentType = z.infer<typeof DocumentTypeSchema>;
export type TrusteeAccessLevel = z.infer<typeof TrusteeAccessLevelSchema>;
export type VaultDocument = z.infer<typeof VaultDocumentSchema>;
export type TrusteeAssignment = z.infer<typeof TrusteeAssignmentSchema>;
export type LegacyVault = z.infer<typeof LegacyVaultSchema>;
export type SuccessionPlan = z.infer<typeof SuccessionPlanSchema>;
export type ExportBundle = z.infer<typeof ExportBundleSchema>;