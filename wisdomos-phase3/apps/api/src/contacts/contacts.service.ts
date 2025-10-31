import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneE164?: string;
  hubspotId?: string;
  salesforceId?: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactLifeAreaLink {
  id: string;
  contactId: string;
  lifeAreaId: number;
  roleLabel?: string;
  frequency?: string;
  weight?: number;
  outcomes?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interaction {
  id: string;
  contactId: string;
  lifeAreaId?: number;
  occurredAt: Date;
  channel: string;
  direction?: string;
  subject?: string;
  bodyText?: string;
  bodyHtml?: string;
  uri?: string;
  sentiment?: string;
  sentimentScore?: number;
  topics?: string[];
  entities?: any;
  meta?: any;
  createdAt: Date;
}

export interface RelationshipAssessment {
  id: string;
  contactId: string;
  lifeAreaId: number;
  assessedOn: Date;
  trustScore?: number;
  communication?: number;
  reliability?: number;
  alignment?: number;
  overall?: number;
  notes?: string;
  createdAt: Date;
}

@Injectable()
export class ContactsService {
  private contacts: Map<string, Contact> = new Map();
  private links: Map<string, ContactLifeAreaLink> = new Map();
  private interactions: Map<string, Interaction> = new Map();
  private assessments: Map<string, RelationshipAssessment> = new Map();

  constructor(private database: DatabaseService) {
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Initialize contacts
    const djamel: Contact = {
      id: 'contact-djamel',
      firstName: 'Djamel',
      lastName: '',
      email: 'djamel@example.com',
      notes: 'Partner across intimacy, health, spirituality, sexuality',
      tags: ['partner', 'core'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const michael: Contact = {
      id: 'contact-michael',
      firstName: 'Michael',
      lastName: 'Smith',
      email: 'michael@example.com',
      notes: 'Friend / operations reflection',
      tags: ['friend', 'ops'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const zied: Contact = {
      id: 'contact-zied',
      firstName: 'Zied',
      lastName: 'Johnson',
      email: 'zied@example.com',
      notes: 'Tactical & design insight',
      tags: ['friend', 'design'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.contacts.set(djamel.id, djamel);
    this.contacts.set(michael.id, michael);
    this.contacts.set(zied.id, zied);

    // Initialize links
    const djamelLinks = [
      { lifeAreaId: 4, roleLabel: 'partner', frequency: 'daily', weight: 0.9, outcomes: 'Presence, honesty, shared vision' },
      { lifeAreaId: 2, roleLabel: 'partner', frequency: 'daily', weight: 0.9, outcomes: 'Meal/rest support & encouragement' },
      { lifeAreaId: 6, roleLabel: 'partner', frequency: 'daily', weight: 0.9, outcomes: 'Occasional spiritual dialogue' },
      { lifeAreaId: 11, roleLabel: 'partner', frequency: 'daily', weight: 0.9, outcomes: 'Embodiment/erotic safety' },
    ];

    djamelLinks.forEach((link, idx) => {
      const linkRecord: ContactLifeAreaLink = {
        id: `link-djamel-${idx}`,
        contactId: djamel.id,
        ...link,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.links.set(linkRecord.id, linkRecord);
    });

    // Initialize a sample interaction
    const interaction: Interaction = {
      id: 'interaction-1',
      contactId: djamel.id,
      lifeAreaId: 4,
      occurredAt: new Date(),
      channel: 'whatsapp',
      direction: 'inbound',
      subject: 'Evening check-in',
      bodyText: 'Hey love, how was your day?',
      sentiment: 'positive',
      sentimentScore: 0.65,
      topics: ['connection', 'check-in'],
      meta: { source: 'whatsapp', threadId: 'wa_abc123' },
      createdAt: new Date(),
    };
    this.interactions.set(interaction.id, interaction);

    // Initialize a sample assessment
    const assessment: RelationshipAssessment = {
      id: 'assessment-1',
      contactId: djamel.id,
      lifeAreaId: 4,
      assessedOn: new Date(),
      trustScore: 4.5,
      communication: 4.0,
      reliability: 4.0,
      alignment: 4.8,
      overall: 4.3,
      notes: 'Post-weekend reflection',
      createdAt: new Date(),
    };
    this.assessments.set(assessment.id, assessment);
  }

  // Contact CRUD operations
  async createContact(data: Partial<Contact>): Promise<Contact> {
    const contact: Contact = {
      id: `contact-${Date.now()}`,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email,
      phoneE164: data.phoneE164,
      hubspotId: data.hubspotId,
      salesforceId: data.salesforceId,
      notes: data.notes,
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.contacts.set(contact.id, contact);
    return contact;
  }

  async getContact(id: string): Promise<Contact | null> {
    return this.contacts.get(id) || null;
  }

  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const contact = this.contacts.get(id);
    if (!contact) {
      throw new Error('Contact not found');
    }
    const updated = { ...contact, ...updates, updatedAt: new Date() };
    this.contacts.set(id, updated);
    return updated;
  }

  // Contact-LifeArea link operations
  async createLink(data: Partial<ContactLifeAreaLink>): Promise<ContactLifeAreaLink> {
    const link: ContactLifeAreaLink = {
      id: `link-${Date.now()}`,
      contactId: data.contactId!,
      lifeAreaId: data.lifeAreaId!,
      roleLabel: data.roleLabel,
      frequency: data.frequency,
      weight: data.weight,
      outcomes: data.outcomes,
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.links.set(link.id, link);
    return link;
  }

  async getContactLinks(contactId: string): Promise<ContactLifeAreaLink[]> {
    return Array.from(this.links.values()).filter(l => l.contactId === contactId);
  }

  async getLifeAreaContacts(lifeAreaId: number): Promise<Array<Contact & { link: ContactLifeAreaLink }>> {
    const areaLinks = Array.from(this.links.values()).filter(l => l.lifeAreaId === lifeAreaId);
    return areaLinks.map(link => {
      const contact = this.contacts.get(link.contactId);
      return { ...contact!, link };
    });
  }

  // Interaction operations
  async createInteraction(data: Partial<Interaction>): Promise<Interaction> {
    const interaction: Interaction = {
      id: `interaction-${Date.now()}`,
      contactId: data.contactId!,
      lifeAreaId: data.lifeAreaId,
      occurredAt: data.occurredAt || new Date(),
      channel: data.channel!,
      direction: data.direction,
      subject: data.subject,
      bodyText: data.bodyText,
      bodyHtml: data.bodyHtml,
      uri: data.uri,
      sentiment: data.sentiment,
      sentimentScore: data.sentimentScore,
      topics: data.topics,
      entities: data.entities,
      meta: data.meta,
      createdAt: new Date(),
    };
    this.interactions.set(interaction.id, interaction);
    return interaction;
  }

  async getContactInteractions(contactId: string): Promise<Interaction[]> {
    return Array.from(this.interactions.values())
      .filter(i => i.contactId === contactId)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }

  // Assessment operations
  async createAssessment(data: Partial<RelationshipAssessment>): Promise<RelationshipAssessment> {
    const assessment: RelationshipAssessment = {
      id: `assessment-${Date.now()}`,
      contactId: data.contactId!,
      lifeAreaId: data.lifeAreaId!,
      assessedOn: data.assessedOn || new Date(),
      trustScore: data.trustScore,
      communication: data.communication,
      reliability: data.reliability,
      alignment: data.alignment,
      overall: data.overall,
      notes: data.notes,
      createdAt: new Date(),
    };
    this.assessments.set(assessment.id, assessment);
    return assessment;
  }

  async getContactAssessments(contactId: string): Promise<RelationshipAssessment[]> {
    return Array.from(this.assessments.values())
      .filter(a => a.contactId === contactId)
      .sort((a, b) => b.assessedOn.getTime() - a.assessedOn.getTime());
  }

  async getLatestAssessment(contactId: string, lifeAreaId: number): Promise<RelationshipAssessment | null> {
    const assessments = Array.from(this.assessments.values())
      .filter(a => a.contactId === contactId && a.lifeAreaId === lifeAreaId)
      .sort((a, b) => b.assessedOn.getTime() - a.assessedOn.getTime());
    return assessments[0] || null;
  }

  // Analytics operations
  async getRelationshipHealth(contactId: string): Promise<{
    contact: Contact;
    lifeAreas: Array<{
      lifeAreaId: number;
      roleLabel?: string;
      frequency?: string;
      weight?: number;
      latestAssessment?: RelationshipAssessment;
      interactionCount: number;
      lastInteraction?: Date;
    }>;
    overallHealth: number;
  }> {
    const contact = this.contacts.get(contactId);
    if (!contact) {
      throw new Error('Contact not found');
    }

    const links = await this.getContactLinks(contactId);
    const interactions = await this.getContactInteractions(contactId);
    
    const lifeAreas = await Promise.all(links.map(async (link) => {
      const areaInteractions = interactions.filter(i => i.lifeAreaId === link.lifeAreaId);
      const latestAssessment = await this.getLatestAssessment(contactId, link.lifeAreaId);
      
      return {
        lifeAreaId: link.lifeAreaId,
        roleLabel: link.roleLabel,
        frequency: link.frequency,
        weight: link.weight,
        latestAssessment,
        interactionCount: areaInteractions.length,
        lastInteraction: areaInteractions[0]?.occurredAt,
      };
    }));

    // Calculate overall health based on assessments and interactions
    const assessmentScores = lifeAreas
      .filter(a => a.latestAssessment?.overall)
      .map(a => a.latestAssessment!.overall!);
    
    const overallHealth = assessmentScores.length > 0
      ? assessmentScores.reduce((sum, score) => sum + score, 0) / assessmentScores.length
      : 0;

    return {
      contact,
      lifeAreas,
      overallHealth,
    };
  }
}