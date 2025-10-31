// Database service layer - exports all services
export { UserService, userService } from './users'
export { OrganizationService, organizationService } from './organizations'
export { LifeAreaService, lifeAreaService } from './life-areas'
export { JournalService, journalService } from './journal'
export { UpsetInquiryService, upsetInquiryService } from './upset-inquiries'
export { PriorityItemService, priorityItemService } from './priority-items'
export { ContributionService, contributionService } from './contributions'
export { AutobiographyService, autobiographyService } from './autobiography'
export { AnalyticsService, analyticsService } from './analytics'
export { ContactService, contactService } from '../contacts'

// Re-export common types
export type {
  User, Organization, Contact, LifeArea, ContactLifeAreaLink,
  JournalEntry, UpsetInquiry, PriorityItem, Contribution, AutobiographyEvent,
  AnalyticsData, ContactWithLifeAreas, LifeAreaWithContacts
} from '@/types/database'