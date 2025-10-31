import { readFileSync } from 'fs'
import { join } from 'path'
import { EditionManifestSchema, type EditionManifest, type EditionId } from './schema'

let cachedManifest: EditionManifest | null = null

export function loadEditionManifest(editionId?: EditionId): EditionManifest {
  // Use cached manifest if available
  if (cachedManifest) {
    return cachedManifest
  }

  // Determine edition from environment or default
  const edition = editionId || 
                 (process.env.EDITION as EditionId) || 
                 (process.env.NEXT_PUBLIC_EDITION as EditionId) || 
                 'personal'

  // Load manifest file
  const manifestPath = join(process.cwd(), 'editions', edition, 'manifest.json')
  
  try {
    const manifestJson = readFileSync(manifestPath, 'utf-8')
    const manifest = JSON.parse(manifestJson)
    
    // Validate with Zod
    const validated = EditionManifestSchema.parse(manifest)
    
    // Cache for subsequent calls
    cachedManifest = validated
    
    return validated
  } catch (error) {
    console.error(`Failed to load edition manifest for "${edition}":`, error)
    throw new Error(`Edition manifest not found or invalid: ${edition}`)
  }
}

// Clear cache (useful for testing)
export function clearManifestCache() {
  cachedManifest = null
}
