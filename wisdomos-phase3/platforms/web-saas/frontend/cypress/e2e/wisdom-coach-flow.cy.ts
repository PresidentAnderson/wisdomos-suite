/**
 * E2E Test: Wisdom Coach Flow
 * Tests the complete coaching journey from upset entry to completion
 */

describe('Wisdom Coach Flow', () => {
  beforeEach(() => {
    // Reset localStorage and seed demo data
    cy.window().then((win) => {
      win.localStorage.clear()
    })
    
    // Seed demo data
    cy.visit('/') // Load app first
    cy.window().then((win) => {
      // Seed demo upset entry
      const demoUpset = {
        id: 'ups_demo_001',
        title: 'Felt dismissed when plans changed last minute',
        facts: 'We planned a call at 7pm. At 6:58pm I got a text: "Can\'t talk tonight." No prior heads-up.',
        story: 'They don\'t respect my time; I\'m not a priority; I always have to adapt.',
        people: ['Jamel'],
        mood: 'frustrated',
        moodScore: 3,
        createdAt: new Date().toISOString()
      }
      
      // Seed life areas
      const lifeAreas = [
        {
          id: 'relationships',
          name: 'Relationships',
          phoenixName: 'Sacred Connections',
          status: 'attention',
          commitments: ['Honesty & direct communication', 'Co-create the relationship']
        },
        {
          id: 'work-purpose',
          name: 'Work & Purpose',
          phoenixName: 'Sacred Mission',
          status: 'thriving',
          commitments: ['Be present', 'Deliver excellence']
        }
      ]
      
      // Seed commitments
      const commitments = [
        { id: 'cmt_honesty', name: 'Honesty & direct communication', areaId: 'relationships' },
        { id: 'cmt_co_create', name: 'Co-create the relationship', areaId: 'relationships' },
        { id: 'cmt_presence', name: 'Be present', areaId: 'work-purpose' }
      ]
      
      win.localStorage.setItem('wisdomos_upsets', JSON.stringify([demoUpset]))
      win.localStorage.setItem('wisdomos_life_areas', JSON.stringify(lifeAreas))
      win.localStorage.setItem('wisdomos_commitments', JSON.stringify(commitments))
      win.localStorage.setItem('wisdomos_fulfillment_tasks', JSON.stringify([]))
    })
  })

  it('should complete full coaching flow from upset to task creation', () => {
    // 1. Navigate to main page and verify upset exists
    cy.visit('/')
    cy.contains('Felt dismissed when plans changed').should('be.visible')
    
    // 2. Click on upset to open details (assuming upset cards exist)
    cy.contains('Felt dismissed when plans changed').click()
    
    // 3. Look for "Start Coaching" or "Get Coach Help" button
    cy.get('[data-cy="start-coaching"], [data-cy="coach-help"]')
      .should('be.visible')
      .click()
    
    // 4. Should navigate to Wisdom Coach page or open coach modal
    cy.url().should('include', '/wisdom-coach')
    
    // 5. Verify coaching panel is loaded
    cy.get('[data-cy="wisdom-coach-panel"]').should('be.visible')
    cy.contains('Phoenix Wisdom Coach').should('be.visible')
    
    // 6. If no active session, start manual session
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="start-manual-session"]').length > 0) {
        cy.get('[data-cy="start-manual-session"]').click()
      }
    })
    
    // 7. Verify active coaching session
    cy.contains('Active Coaching Session').should('be.visible')
    
    // 8. Check for insights generated
    cy.get('[data-cy="coaching-insights"]').should('be.visible')
    cy.contains('Insights').should('be.visible')
    
    // 9. Verify recommendations are shown
    cy.get('[data-cy="coaching-recommendations"]').should('be.visible')
    cy.contains('Recommendations').should('be.visible')
    
    // 10. Accept a recommendation (click Accept button)
    cy.get('[data-cy="accept-recommendation"]').first().click()
    
    // 11. Expand recommendation to see action steps
    cy.get('[data-cy="expand-recommendation"]').first().click()
    
    // 12. Complete an action step
    cy.get('[data-cy="action-step-checkbox"]').first().click()
    
    // 13. Verify progress bar updates
    cy.get('[data-cy="progress-bar"]').should('be.visible')
    
    // 14. Complete the coaching session
    cy.get('[data-cy="complete-session"]').click()
    
    // 15. Verify session is marked as completed
    cy.contains('Session completed').should('be.visible')
    
    // 16. Navigate to Fulfillment Display to check for new tasks
    cy.visit('/')
    
    // 17. Look for newly created task in Relationships area
    cy.get('[data-cy="life-area-relationships"]').should('be.visible')
    cy.get('[data-cy="life-area-relationships"]').within(() => {
      cy.contains('Propose cancellation protocol').should('be.visible')
    })
    
    // 18. Verify task is linked to correct commitment
    cy.get('[data-cy="task-commitments"]').should('contain', 'Honesty & direct communication')
    
    // 19. Check coaching session history
    cy.visit('/wisdom-coach')
    cy.get('[data-cy="history-tab"]').click()
    
    // 20. Verify completed session appears in history
    cy.contains('Coaching History').should('be.visible')
    cy.contains('Completed').should('be.visible')
    cy.contains('1 sessions').should('be.visible')
    
    // 21. Check analytics view
    cy.get('[data-cy="analytics-tab"]').click()
    cy.contains('Total Sessions').should('be.visible')
    cy.contains('1').should('be.visible') // Session count
    
    // 22. Verify metrics are calculated correctly
    cy.contains('Insights Generated').should('be.visible')
    cy.contains('Recommendations').should('be.visible')
    cy.contains('Completion Rate').should('be.visible')
  })

  it('should handle voice note integration', () => {
    // Start coaching session
    cy.visit('/wisdom-coach')
    cy.get('[data-cy="start-manual-session"]').click()
    
    // Test voice note recording
    cy.get('[data-cy="voice-note-button"]').should('be.visible').click()
    
    // Verify recording indicator
    cy.contains('Recording voice note').should('be.visible')
    cy.get('[data-cy="recording-indicator"]').should('be.visible')
    
    // Stop recording
    cy.get('[data-cy="stop-recording"]').click()
    
    // Verify voice note appears
    cy.get('[data-cy="voice-notes"]').should('be.visible')
    cy.contains('Voice Note').should('be.visible')
    cy.contains('45s').should('be.visible') // Mock duration
  })

  it('should trigger coaching from journal entries', () => {
    // Navigate to journal page
    cy.visit('/journal')
    
    // Create a new journal entry that should trigger coaching
    cy.get('[data-cy="new-entry"]').click()
    
    // Fill in emotional content that triggers coaching
    cy.get('[data-cy="journal-title"]').type('Feeling overwhelmed and hopeless')
    cy.get('[data-cy="journal-body"]').type(
      'I can\'t handle this anymore. Everything feels like it\'s falling apart. ' +
      'I feel hopeless and don\'t see a way forward. This is too much.'
    )
    
    // Select negative mood
    cy.get('[data-cy="mood-select"]').select('hopeless')
    
    // Save journal entry
    cy.get('[data-cy="save-journal"]').click()
    
    // Verify coaching session is triggered automatically
    cy.visit('/wisdom-coach')
    cy.contains('Active Coaching Session').should('be.visible')
    cy.contains('Triggered by: journal').should('be.visible')
    
    // Verify coaching provides immediate support
    cy.contains('Immediate support needed').should('be.visible')
    cy.get('[data-cy="coaching-insights"]').should('contain', 'support')
  })

  it('should handle coaching triggers from life area decline', () => {
    // Seed declining life area data
    cy.window().then((win) => {
      const moodHistory = [
        { mood: 'sad', lifeAreaId: 'relationships', date: new Date().toISOString(), score: 2 },
        { mood: 'frustrated', lifeAreaId: 'relationships', date: new Date(Date.now() - 86400000).toISOString(), score: 3 },
        { mood: 'angry', lifeAreaId: 'relationships', date: new Date(Date.now() - 172800000).toISOString(), score: 2 }
      ]
      win.localStorage.setItem('wisdomos_mood_history', JSON.stringify(moodHistory))
    })
    
    // Visit wisdom coach - should auto-trigger from declining pattern
    cy.visit('/wisdom-coach')
    
    // Verify trigger detection
    cy.contains('Active Coaching Session').should('be.visible')
    cy.contains('life area decline').should('be.visible')
    
    // Verify coaching focuses on the declining area
    cy.get('[data-cy="coaching-insights"]').should('contain', 'Relationships')
    cy.contains('boundary reset').should('be.visible')
  })

  it('should connect coaching recommendations to fulfillment display', () => {
    // Complete coaching session with recommendations
    cy.visit('/wisdom-coach')
    cy.get('[data-cy="start-manual-session"]').click()
    cy.get('[data-cy="accept-recommendation"]').first().click()
    cy.get('[data-cy="complete-session"]').click()
    
    // Navigate to fulfillment display
    cy.visit('/')
    
    // Verify new items appear in correct life areas
    cy.get('[data-cy="fulfillment-display"]').should('be.visible')
    
    // Check for coaching-generated tasks
    cy.get('[data-cy="coaching-tasks"]').should('be.visible')
    cy.contains('From Coaching Session').should('be.visible')
    
    // Verify tasks are properly categorized
    cy.get('[data-cy="life-area-relationships"]').within(() => {
      cy.get('[data-cy="task-source-coach"]').should('be.visible')
    })
    
    // Check task completion flow
    cy.get('[data-cy="task-complete"]').first().click()
    cy.contains('Task completed').should('be.visible')
    
    // Verify completion is tracked back to coaching session
    cy.visit('/wisdom-coach')
    cy.get('[data-cy="analytics-tab"]').click()
    cy.contains('Recommendations Completed').should('contain', '1')
  })
})