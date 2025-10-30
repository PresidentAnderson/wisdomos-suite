// Supabase database integration
// Migrated from localStorage to real database persistence
import { supabase } from './supabase'
import { userService, organizationService } from './database'

export const db = {
  user: {
    findUnique: async (where: { id?: string; email?: string }) => {
      if (where.id) {
        const { data, error } = await userService.getUserById(where.id)
        return error ? null : data
      }
      if (where.email) {
        const { data, error } = await userService.getUserByEmail(where.email)
        return error ? null : data
      }
      return null
    },
    create: async (data: any) => {
      const { data: user, error } = await userService.createUser(data)
      return error ? null : user
    },
    update: async (where: { id: string }, data: any) => {
      const { data: user, error } = await userService.updateUser(where.id, data)
      return error ? null : user
    }
  },
  tenant: {
    findUnique: async (where: { id?: string; slug?: string }) => {
      if (where.id) {
        const { data, error } = await organizationService.getOrganizationById(where.id)
        return error ? null : data
      }
      if (where.slug) {
        const { data, error } = await organizationService.getOrganizationBySlug(where.slug)
        return error ? null : data
      }
      return null
    },
    create: async (data: any) => {
      const { data: organization, error } = await organizationService.createOrganization(data)
      return error ? null : organization
    },
    update: async (where: { id: string }, data: any) => {
      const { data: organization, error } = await organizationService.updateOrganization(where.id, data)
      return error ? null : organization
    }
  }
}

// Export services for direct access
export {
  userService,
  organizationService,
  contactService,
  lifeAreaService,
  journalService,
  upsetInquiryService,
  priorityItemService,
  contributionService,
  autobiographyService,
  analyticsService
} from './database'

// Backward compatibility for existing auth system
export { supabase } from './supabase'