import { z } from 'zod'

export const EditionManifestSchema = z.object({
  id: z.enum(['personal', 'coach', 'org']),
  name: z.string(),
  version: z.string(),
  description: z.string(),
  branding: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    logo: z.string(),
    favicon: z.string(),
    appName: z.string(),
  }),
  features: z.object({
    core: z.record(z.boolean()),
    assessments: z.record(z.boolean()),
    social: z.record(z.boolean()),
    coaching: z.record(z.boolean()),
    organization: z.record(z.boolean()),
    integrations: z.record(z.boolean()),
  }),
  platforms: z.array(z.enum(['web', 'mobile', 'desktop'])),
  copySet: z.string(),
  theme: z.object({
    mode: z.enum(['light', 'dark']),
    customization: z.boolean(),
    whiteLabel: z.boolean().optional(),
  }),
  limits: z.record(z.union([z.number(), z.literal(-1)])),
  pricing: z.object({
    tier: z.string(),
    model: z.string(),
    price: z.number().optional(),
    contactSales: z.boolean().optional(),
  }),
})

export type EditionManifest = z.infer<typeof EditionManifestSchema>
export type EditionId = EditionManifest['id']
export type EditionFeatures = EditionManifest['features']
