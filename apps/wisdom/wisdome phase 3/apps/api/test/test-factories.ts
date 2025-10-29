import { CreateContributionDto } from '../src/contributions/dto/contribution.dto';

export class TestDataFactory {
  static createContributionDto(overrides: Partial<CreateContributionDto> = {}): CreateContributionDto {
    return {
      category: 'Doing',
      title: 'Test Contribution',
      description: 'Test description for contribution',
      contributions: [
        'First contribution bullet point',
        'Second contribution bullet point',
        'Third contribution bullet point',
      ],
      impact: 'This will have a significant positive impact',
      commitment: 'I commit to completing this within 30 days',
      tags: [],
      visibility: 'private',
      ...overrides,
    };
  }

  static createDoingContribution(overrides: any = {}) {
    return this.createContributionDto({
      category: 'Doing',
      title: 'Doing Category Contribution',
      description: 'A contribution in the Doing category',
      ...overrides,
    });
  }

  static createBeingContribution(overrides: any = {}) {
    return this.createContributionDto({
      category: 'Being',
      title: 'Being Category Contribution',
      description: 'A contribution in the Being category',
      ...overrides,
    });
  }

  static createHavingContribution(overrides: any = {}) {
    return this.createContributionDto({
      category: 'Having',
      title: 'Having Category Contribution',
      description: 'A contribution in the Having category',
      ...overrides,
    });
  }

  static createCommunityTaggedContribution(overrides: any = {}) {
    return this.createContributionDto({
      title: 'Community Tagged Contribution',
      tags: ['community', 'collaboration'],
      description: 'A contribution with community tag',
      ...overrides,
    });
  }

  static createContributionWithAllFields(overrides: any = {}) {
    return this.createContributionDto({
      category: 'Doing',
      title: 'Complete Contribution Example',
      description: 'This is a complete contribution with all fields filled',
      contributions: [
        'Detailed first contribution point',
        'Comprehensive second contribution point',
        'Thorough third contribution point',
      ],
      impact: 'This will revolutionize our approach to testing',
      commitment: 'I am fully committed to delivering this with excellence',
      tags: ['testing', 'quality', 'automation'],
      visibility: 'public',
      ...overrides,
    });
  }

  static createMinimalContribution(overrides: any = {}) {
    return this.createContributionDto({
      category: 'Being',
      title: 'Minimal Contribution',
      contributions: ['Single bullet point'],
      ...overrides,
    });
  }

  // Expected life area mappings based on mirroring rules
  static getExpectedLifeAreas(contribution: any): string[] {
    const areas = ['work-purpose', 'creativity-expression'];
    
    if (
      contribution.category === 'Doing' || 
      (contribution.tags && contribution.tags.includes('community'))
    ) {
      areas.push('community-contribution');
    }
    
    return areas;
  }

  // Expected priority based on life area
  static getExpectedPriority(lifeAreaSlug: string): number {
    return lifeAreaSlug === 'work-purpose' ? 4 : 3;
  }

  // Generate test user data
  static createTestUser(overrides: any = {}) {
    return {
      id: `test-user-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      passwordHash: 'test-hash',
      ...overrides,
    };
  }

  // Generate test life area data
  static createTestLifeArea(overrides: any = {}) {
    const timestamp = Date.now();
    return {
      id: `area-${timestamp}`,
      slug: `test-area-${timestamp}`,
      name: `Test Area ${timestamp}`,
      ...overrides,
    };
  }
}