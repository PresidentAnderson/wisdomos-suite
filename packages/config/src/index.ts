import { loadEditionManifest, clearManifestCache } from './loader'
import type { EditionManifest, EditionId, EditionFeatures } from './schema'

// Load the current edition manifest
const manifest = loadEditionManifest()

// Export manifest and utilities
export { loadEditionManifest, clearManifestCache }
export type { EditionManifest, EditionId, EditionFeatures }

// Export convenient feature accessors
export const edition = manifest
export const features = manifest.features
export const branding = manifest.branding
export const limits = manifest.limits
export const pricing = manifest.pricing

// Feature check helpers
export function hasFeature(category: keyof EditionFeatures, feature: string): boolean {
  return manifest.features[category]?.[feature] === true
}

export function hasAnyFeature(category: keyof EditionFeatures, featureList: string[]): boolean {
  return featureList.some(feature => hasFeature(category, feature))
}

export function hasAllFeatures(category: keyof EditionFeatures, featureList: string[]): boolean {
  return featureList.every(feature => hasFeature(category, feature))
}

// React hook for client-side feature flags
export function useFeature(category: keyof EditionFeatures, feature: string): boolean {
  return hasFeature(category, feature)
}

// Edition check helpers
export function isPersonalEdition(): boolean {
  return manifest.id === 'personal'
}

export function isCoachEdition(): boolean {
  return manifest.id === 'coach'
}

export function isOrgEdition(): boolean {
  return manifest.id === 'org'
}

export function isPlatformSupported(platform: 'web' | 'mobile' | 'desktop'): boolean {
  return manifest.platforms.includes(platform)
}
