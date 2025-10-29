/**
 * Contribution Upsert Service
 * Maps HubSpot entities to WisdomOS Being/Doing/Having contributions
 */

export type Source = 'hubspot'
export type HubSpotEntity = 'contact' | 'company' | 'deal' | 'ticket'
export type ContributionType = 'being' | 'doing' | 'having'

export interface InboundPayload {
  source: Source
  entity: HubSpotEntity
  id: string
  properties: Record<string, any>
  associations?: Record<string, string[]>
  updatedAt: string
}

export interface Contribution {
  id: string
  externalId: string
  type: ContributionType
  title: string
  description: string
  entity: HubSpotEntity
  entityId: string
  properties: Record<string, any>
  associations: Record<string, string[]>
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
  metadata: {
    source: Source
    syncedAt: string
    lastWebhookAt?: string
  }
}

// Entity to Contribution Type mapping
const ENTITY_TYPE_MAP: Record<HubSpotEntity, ContributionType> = {
  'contact': 'being',    // Relationships, people
  'company': 'having',    // Assets, contexts
  'deal': 'doing',       // Active work, commitments
  'ticket': 'doing'      // Tasks, issues
}

export async function upsertFromHubSpot(
  payload: InboundPayload
): Promise<Contribution> {
  const { source, entity, id, properties, associations = {}, updatedAt } = payload
  
  // Generate external ID
  const externalId = `${source}:${entity}:${id}`
  
  // Determine contribution type
  const contributionType = ENTITY_TYPE_MAP[entity]
  
  // Extract meaningful title and description
  const { title, description } = extractContentFromProperties(entity, properties)
  
  // Build contribution object
  const contribution: Contribution = {
    id: generateContributionId(externalId),
    externalId,
    type: contributionType,
    title,
    description,
    entity,
    entityId: id,
    properties,
    associations,
    status: determineStatus(properties),
    createdAt: properties.createdate || updatedAt,
    updatedAt,
    metadata: {
      source,
      syncedAt: new Date().toISOString(),
      lastWebhookAt: new Date().toISOString()
    }
  }
  
  // Persist contribution
  await persistContribution(contribution)
  
  // Emit domain event for UI updates
  await emitContributionEvent(contribution)
  
  // Update Fulfillment Display if needed
  await updateFulfillmentDisplay(contribution)
  
  return contribution
}

function extractContentFromProperties(
  entity: HubSpotEntity,
  properties: Record<string, any>
): { title: string; description: string } {
  let title = ''
  let description = ''
  
  switch (entity) {
    case 'contact':
      title = `${properties.firstname || ''} ${properties.lastname || ''}`.trim() 
        || properties.email 
        || 'Unknown Contact'
      description = [
        properties.jobtitle,
        properties.company,
        properties.phone
      ].filter(Boolean).join(' • ')
      break
      
    case 'company':
      title = properties.name || 'Unknown Company'
      description = [
        properties.industry,
        properties.city,
        properties.country
      ].filter(Boolean).join(' • ')
      break
      
    case 'deal':
      title = properties.dealname || 'Unknown Deal'
      description = `Stage: ${properties.dealstage || 'N/A'} • Amount: ${
        properties.amount ? `$${properties.amount}` : 'N/A'
      }`
      break
      
    case 'ticket':
      title = properties.subject || 'Unknown Ticket'
      description = `Priority: ${properties.hs_ticket_priority || 'N/A'} • Status: ${
        properties.hs_pipeline_stage || 'N/A'
      }`
      break
  }
  
  return { title, description }
}

function determineStatus(properties: Record<string, any>): 'active' | 'archived' {
  // Check for common archived/closed indicators
  const closedStates = ['closed', 'archived', 'deleted', 'closedwon', 'closedlost']
  
  const status = (
    properties.hs_pipeline_stage ||
    properties.dealstage ||
    properties.lifecyclestage ||
    ''
  ).toLowerCase()
  
  return closedStates.includes(status) ? 'archived' : 'active'
}

function generateContributionId(externalId: string): string {
  // Generate deterministic ID from external ID
  const hash = require('crypto')
    .createHash('sha256')
    .update(externalId)
    .digest('hex')
  
  return `contrib_${hash.substring(0, 12)}`
}

async function persistContribution(contribution: Contribution): Promise<void> {
  // In production, save to database
  // For now, save to localStorage for demo
  if (typeof window !== 'undefined') {
    const contributions = JSON.parse(
      localStorage.getItem('wisdomos_contributions') || '[]'
    )
    
    // Upsert logic - find and update or add new
    const existingIndex = contributions.findIndex(
      (c: Contribution) => c.externalId === contribution.externalId
    )
    
    if (existingIndex >= 0) {
      contributions[existingIndex] = contribution
    } else {
      contributions.push(contribution)
    }
    
    localStorage.setItem('wisdomos_contributions', JSON.stringify(contributions))
  }
  
  console.log(`[Contribution] Upserted: ${contribution.externalId}`)
}

async function emitContributionEvent(contribution: Contribution): Promise<void> {
  // Emit custom event for UI components to listen to
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('contribution.upserted', {
      detail: contribution
    })
    window.dispatchEvent(event)
  }
  
  // In production, use event bus or message queue
  console.log(`[Event] contribution.upserted:`, contribution.id)
}

async function updateFulfillmentDisplay(contribution: Contribution): Promise<void> {
  // Map contribution to appropriate life area
  const lifeAreaMapping: Record<ContributionType, string[]> = {
    'being': ['relationships', 'community', 'family'],
    'doing': ['career', 'projects', 'health'],
    'having': ['finance', 'environment', 'resources']
  }
  
  const relevantAreas = lifeAreaMapping[contribution.type]
  
  // Update fulfillment scores based on contribution
  if (typeof window !== 'undefined') {
    const fulfillmentData = JSON.parse(
      localStorage.getItem('wisdomos_fulfillment') || '{}'
    )
    
    relevantAreas.forEach(area => {
      if (!fulfillmentData[area]) {
        fulfillmentData[area] = {
          score: 0,
          contributions: []
        }
      }
      
      // Add contribution reference
      if (!fulfillmentData[area].contributions.includes(contribution.id)) {
        fulfillmentData[area].contributions.push(contribution.id)
      }
      
      // Update score based on contribution status
      if (contribution.status === 'active') {
        fulfillmentData[area].score = Math.min(10, fulfillmentData[area].score + 0.5)
      }
    })
    
    localStorage.setItem('wisdomos_fulfillment', JSON.stringify(fulfillmentData))
  }
  
  console.log(`[Fulfillment] Updated display for ${contribution.type} contribution`)
}

// Export batch processing function for backfill
export async function batchUpsertFromHubSpot(
  payloads: InboundPayload[]
): Promise<Contribution[]> {
  const contributions: Contribution[] = []
  
  for (const payload of payloads) {
    try {
      const contribution = await upsertFromHubSpot(payload)
      contributions.push(contribution)
    } catch (error) {
      console.error(`Error processing ${payload.entity} ${payload.id}:`, error)
    }
  }
  
  return contributions
}