import axios, { AxiosInstance } from "axios";
import { prisma } from "../prisma.js";

export interface HubSpotConfig {
  accessToken: string;
  portalId?: string;
}

export interface HubSpotContact {
  vid?: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    notes?: string;
    [key: string]: any;
  };
}

export interface HubSpotEngagement {
  engagement: {
    active: boolean;
    type: "NOTE" | "CALL" | "EMAIL" | "MEETING" | "TASK";
    timestamp: number;
  };
  associations: {
    contactIds: number[];
    companyIds?: number[];
    dealIds?: number[];
  };
  metadata: {
    body?: string;
    subject?: string;
    toNumber?: string;
    fromNumber?: string;
    title?: string;
    text?: string;
  };
}

export class HubSpotClient {
  private api: AxiosInstance;
  private config: HubSpotConfig;

  constructor(config: HubSpotConfig) {
    this.config = config;
    this.api = axios.create({
      baseURL: "https://api.hubapi.com",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json"
      }
    });
  }

  /**
   * Search for a contact by email
   */
  async searchContactByEmail(email: string): Promise<HubSpotContact | null> {
    try {
      const response = await this.api.post("/crm/v3/objects/contacts/search", {
        filterGroups: [{
          filters: [{
            propertyName: "email",
            operator: "EQ",
            value: email
          }]
        }]
      });
      
      if (response.data.results && response.data.results.length > 0) {
        const contact = response.data.results[0];
        return {
          vid: contact.id,
          properties: contact.properties
        };
      }
      return null;
    } catch (error) {
      console.error("Error searching HubSpot contact:", error);
      return null;
    }
  }

  /**
   * Create or update a contact in HubSpot
   */
  async upsertContact(contactData: {
    email?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    notes?: string;
    tags?: string[];
  }): Promise<{ hubspotId: string; created: boolean }> {
    try {
      // If email provided, try to find existing contact
      let existingContact: HubSpotContact | null = null;
      if (contactData.email) {
        existingContact = await this.searchContactByEmail(contactData.email);
      }

      const properties: any = {
        firstname: contactData.firstName,
        lastname: contactData.lastName
      };

      if (contactData.email) properties.email = contactData.email;
      if (contactData.phone) properties.phone = contactData.phone;
      if (contactData.notes) properties.notes = contactData.notes;
      if (contactData.tags && contactData.tags.length > 0) {
        properties.tags = contactData.tags.join(", ");
      }

      if (existingContact && existingContact.vid) {
        // Update existing contact
        await this.api.patch(`/crm/v3/objects/contacts/${existingContact.vid}`, {
          properties
        });
        return { hubspotId: existingContact.vid, created: false };
      } else {
        // Create new contact
        const response = await this.api.post("/crm/v3/objects/contacts", {
          properties
        });
        return { hubspotId: response.data.id, created: true };
      }
    } catch (error) {
      console.error("Error upserting HubSpot contact:", error);
      throw error;
    }
  }

  /**
   * Create an engagement (interaction) in HubSpot
   */
  async createEngagement(data: {
    contactId: string; // HubSpot contact ID
    type: "NOTE" | "CALL" | "EMAIL" | "MEETING";
    subject?: string;
    body?: string;
    timestamp?: Date;
    metadata?: Record<string, any>;
  }): Promise<string> {
    try {
      const engagement: HubSpotEngagement = {
        engagement: {
          active: true,
          type: data.type,
          timestamp: (data.timestamp || new Date()).getTime()
        },
        associations: {
          contactIds: [parseInt(data.contactId)]
        },
        metadata: {}
      };

      // Set metadata based on type
      if (data.type === "NOTE") {
        engagement.metadata.body = data.body || "";
      } else if (data.type === "EMAIL") {
        engagement.metadata.subject = data.subject || "";
        engagement.metadata.text = data.body || "";
      } else if (data.type === "CALL") {
        engagement.metadata.body = data.body || "";
        engagement.metadata.title = data.subject || "Phone Call";
      } else if (data.type === "MEETING") {
        engagement.metadata.body = data.body || "";
        engagement.metadata.title = data.subject || "Meeting";
      }

      // Add custom metadata
      if (data.metadata) {
        Object.assign(engagement.metadata, data.metadata);
      }

      const response = await this.api.post("/engagements/v1/engagements", engagement);
      return response.data.engagement.id;
    } catch (error) {
      console.error("Error creating HubSpot engagement:", error);
      throw error;
    }
  }

  /**
   * Sync a contact from database to HubSpot
   */
  async syncContactToHubSpot(contactId: string): Promise<void> {
    try {
      const contact = await prisma.contact.findUnique({
        where: { id: contactId },
        include: {
          lifeAreaLinks: {
            include: { lifeArea: true }
          }
        }
      });

      if (!contact) {
        throw new Error(`Contact ${contactId} not found`);
      }

      // Prepare contact data
      const contactData = {
        email: contact.email || undefined,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phoneE164 || undefined,
        notes: contact.notes || undefined,
        tags: contact.tags
      };

      // Add life areas to notes if present
      if (contact.lifeAreaLinks.length > 0) {
        const lifeAreas = contact.lifeAreaLinks
          .map(link => `${link.lifeArea.name} (${link.roleLabel || "N/A"})`)
          .join(", ");
        contactData.notes = `${contactData.notes || ""}\nLife Areas: ${lifeAreas}`.trim();
      }

      // Upsert to HubSpot
      const { hubspotId } = await this.upsertContact(contactData);

      // Update database with HubSpot ID
      if (!contact.hubspotId || contact.hubspotId !== hubspotId) {
        await prisma.contact.update({
          where: { id: contactId },
          data: { hubspotId }
        });
      }

      console.log(`✅ Synced contact ${contact.firstName} ${contact.lastName} to HubSpot (ID: ${hubspotId})`);
    } catch (error) {
      console.error(`Error syncing contact ${contactId}:`, error);
      throw error;
    }
  }

  /**
   * Sync an interaction to HubSpot as an engagement
   */
  async syncInteractionToHubSpot(interactionId: string): Promise<void> {
    try {
      const interaction = await prisma.interaction.findUnique({
        where: { id: interactionId },
        include: {
          contact: true,
          lifeArea: true
        }
      });

      if (!interaction) {
        throw new Error(`Interaction ${interactionId} not found`);
      }

      // Ensure contact has HubSpot ID
      if (!interaction.contact.hubspotId) {
        await this.syncContactToHubSpot(interaction.contact.id);
        // Refetch to get updated HubSpot ID
        const updatedContact = await prisma.contact.findUnique({
          where: { id: interaction.contact.id }
        });
        if (!updatedContact?.hubspotId) {
          throw new Error("Failed to sync contact to HubSpot");
        }
        interaction.contact.hubspotId = updatedContact.hubspotId;
      }

      // Map channel to HubSpot engagement type
      let engagementType: "NOTE" | "CALL" | "EMAIL" | "MEETING";
      switch (interaction.channel) {
        case "call":
          engagementType = "CALL";
          break;
        case "email":
          engagementType = "EMAIL";
          break;
        case "meeting":
          engagementType = "MEETING";
          break;
        default:
          engagementType = "NOTE";
      }

      // Prepare body with additional context
      let body = interaction.bodyText || "";
      if (interaction.lifeArea) {
        body = `[${interaction.lifeArea.name}] ${body}`;
      }
      if (interaction.sentiment) {
        body += `\n\nSentiment: ${interaction.sentiment}`;
      }
      if (interaction.topics && interaction.topics.length > 0) {
        body += `\nTopics: ${interaction.topics.join(", ")}`;
      }

      // Create engagement
      const engagementId = await this.createEngagement({
        contactId: interaction.contact.hubspotId,
        type: engagementType,
        subject: interaction.subject || `${engagementType} - ${interaction.channel}`,
        body,
        timestamp: interaction.occurredAt,
        metadata: {
          direction: interaction.direction,
          channel: interaction.channel,
          wisdomosId: interactionId
        }
      });

      // Store engagement ID in meta
      await prisma.interaction.update({
        where: { id: interactionId },
        data: {
          meta: {
            ...((interaction.meta as any) || {}),
            hubspotEngagementId: engagementId
          }
        }
      });

      console.log(`✅ Synced interaction to HubSpot as engagement ${engagementId}`);
    } catch (error) {
      console.error(`Error syncing interaction ${interactionId}:`, error);
      throw error;
    }
  }

  /**
   * Batch sync all contacts without HubSpot IDs
   */
  async syncAllContacts(): Promise<void> {
    try {
      const contacts = await prisma.contact.findMany({
        where: { hubspotId: null }
      });

      console.log(`Found ${contacts.length} contacts to sync to HubSpot`);

      for (const contact of contacts) {
        try {
          await this.syncContactToHubSpot(contact.id);
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to sync contact ${contact.id}:`, error);
        }
      }

      console.log("✅ Batch contact sync complete");
    } catch (error) {
      console.error("Error in batch contact sync:", error);
      throw error;
    }
  }
}

// Export singleton instance if environment configured
let hubspotClient: HubSpotClient | null = null;

export function getHubSpotClient(): HubSpotClient | null {
  if (!hubspotClient && process.env.HUBSPOT_ACCESS_TOKEN) {
    hubspotClient = new HubSpotClient({
      accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
      portalId: process.env.HUBSPOT_PORTAL_ID
    });
  }
  return hubspotClient;
}