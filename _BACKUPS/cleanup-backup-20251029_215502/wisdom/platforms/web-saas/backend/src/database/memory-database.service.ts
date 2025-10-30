import { Injectable } from '@nestjs/common';

@Injectable()
export class MemoryDatabaseService {
  private users = new Map();
  private journals = new Map();
  private lifeAreas = new Map();
  private contributions = new Map();
  private assessments = new Map();
  private contacts = new Map();

  constructor() {
    // Initialize with demo user
    const demoUser = {
      id: 'demo-user-id',
      email: 'demo@wisdomos.com',
      password: 'password123', // In production, this would be hashed
      name: 'Demo User',
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);

    // Initialize demo life areas
    this.initializeDemoData(demoUser.id);
  }

  private initializeDemoData(userId: string) {
    // Demo life areas
    const lifeAreas = [
      { id: '1', userId, name: 'Work & Purpose', score: 75, status: 'thriving' },
      { id: '2', userId, name: 'Health & Recovery', score: 60, status: 'attention' },
      { id: '3', userId, name: 'Finance', score: 80, status: 'thriving' },
      { id: '4', userId, name: 'Intimacy', score: 45, status: 'breakdown' },
      { id: '5', userId, name: 'Friendship', score: 70, status: 'thriving' },
      { id: '6', userId, name: 'Family', score: 65, status: 'attention' },
    ];
    
    lifeAreas.forEach(area => this.lifeAreas.set(area.id, area));

    // Demo journal entries
    const journals = [
      {
        id: '1',
        userId,
        content: 'Had a breakthrough in therapy today about setting boundaries.',
        emotion: 'hopeful',
        lifeAreaId: '2',
        createdAt: new Date(),
      },
      {
        id: '2',
        userId,
        content: 'Feeling overwhelmed with work deadlines.',
        emotion: 'anxious',
        lifeAreaId: '1',
        createdAt: new Date(),
      },
    ];
    
    journals.forEach(journal => this.journals.set(journal.id, journal));

    // Demo contribution
    this.contributions.set(userId, {
      userId,
      identityStatement: 'I am a catalyst for transformation and growth',
      coreStrengths: [
        {
          id: '1',
          strength: 'Strategic Vision',
          description: 'Ability to see the big picture',
          examples: ['Led company restructuring'],
        },
      ],
      naturalContributions: [
        {
          id: '1',
          contribution: 'Problem Solving',
          impact: 'Help teams overcome challenges',
          frequency: 'daily',
        },
      ],
      acknowledgments: [
        {
          id: '1',
          from: 'Sarah M.',
          message: 'Your guidance transformed our approach',
          date: new Date(),
          context: 'Project Phoenix',
        },
      ],
      lastUpdated: new Date(),
    });
  }

  // User methods
  async findUserByEmail(email: string) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async createUser(userData: any) {
    const user = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    this.initializeDemoData(user.id);
    return user;
  }

  async findUserById(id: string) {
    return this.users.get(id);
  }

  // Journal methods
  async createJournal(journalData: any) {
    const journal = {
      id: `journal-${Date.now()}`,
      ...journalData,
      createdAt: new Date(),
    };
    this.journals.set(journal.id, journal);
    return journal;
  }

  async findJournalsByUser(userId: string) {
    const userJournals = [];
    for (const journal of this.journals.values()) {
      if (journal.userId === userId) {
        userJournals.push(journal);
      }
    }
    return userJournals;
  }

  async updateJournal(id: string, updates: any) {
    const journal = this.journals.get(id);
    if (!journal) return null;
    
    const updated = { ...journal, ...updates, updatedAt: new Date() };
    this.journals.set(id, updated);
    return updated;
  }

  async deleteJournal(id: string) {
    return this.journals.delete(id);
  }

  // Life Areas methods
  async findLifeAreasByUser(userId: string) {
    const userLifeAreas = [];
    for (const area of this.lifeAreas.values()) {
      if (area.userId === userId) {
        userLifeAreas.push(area);
      }
    }
    return userLifeAreas;
  }

  async updateLifeArea(id: string, updates: any) {
    const area = this.lifeAreas.get(id);
    if (!area) return null;
    
    const updated = { ...area, ...updates, updatedAt: new Date() };
    this.lifeAreas.set(id, updated);
    return updated;
  }

  // Contribution methods
  async findContributionByUser(userId: string) {
    return this.contributions.get(userId);
  }

  async updateContribution(userId: string, updates: any) {
    const existing = this.contributions.get(userId) || { userId };
    const updated = { ...existing, ...updates, lastUpdated: new Date() };
    this.contributions.set(userId, updated);
    return updated;
  }

  // Assessment methods
  async createAssessment(assessmentData: any) {
    const assessment = {
      id: `assessment-${Date.now()}`,
      ...assessmentData,
      createdAt: new Date(),
    };
    this.assessments.set(assessment.id, assessment);
    return assessment;
  }

  async findAssessmentsByUser(userId: string) {
    const userAssessments = [];
    for (const assessment of this.assessments.values()) {
      if (assessment.userId === userId) {
        userAssessments.push(assessment);
      }
    }
    return userAssessments;
  }

  // Contact methods
  async createContact(contactData: any) {
    const contact = {
      id: `contact-${Date.now()}`,
      ...contactData,
      createdAt: new Date(),
    };
    this.contacts.set(contact.id, contact);
    return contact;
  }

  async findContactsByUser(userId: string) {
    const userContacts = [];
    for (const contact of this.contacts.values()) {
      if (contact.userId === userId) {
        userContacts.push(contact);
      }
    }
    return userContacts;
  }

  async updateContact(id: string, updates: any) {
    const contact = this.contacts.get(id);
    if (!contact) return null;
    
    const updated = { ...contact, ...updates, updatedAt: new Date() };
    this.contacts.set(id, updated);
    return updated;
  }

  async deleteContact(id: string) {
    return this.contacts.delete(id);
  }
}