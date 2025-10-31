'use client'

import { useEffect, useState } from 'react'
import { trackEvent } from '@/lib/analytics'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAInstallState {
  isInstallable: boolean
  isInstalled: boolean
  isStandalone: boolean
  installPrompt: BeforeInstallPromptEvent | null
  install: () => Promise<boolean>
  dismissInstallPrompt: () => void
}

export function usePWA(): PWAInstallState {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if app is running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')
      
      setIsStandalone(isStandaloneMode)
      setIsInstalled(isStandaloneMode)
    }

    // Register service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          })

          console.log('Service Worker registered:', registration)

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available
                  console.log('New content is available, please refresh')
                  
                  // Show update notification
                  if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Update Available', {
                      body: 'A new version of WisdomOS is available. Please refresh to update.',
                      icon: '/icon-192x192.png',
                      tag: 'app-update'
                    })
                  }
                }
              })
            }
          })

          trackEvent('pwa_service_worker_registered')
        } catch (error) {
          console.error('Service Worker registration failed:', error)
          trackEvent('pwa_service_worker_failed', { error: error.message })
        }
      }
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setInstallPrompt(e)
      setIsInstallable(true)
      trackEvent('pwa_install_prompt_shown')
    }

    // Handle app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
      setIsInstallable(false)
      trackEvent('pwa_installed')
    }

    // Handle iOS install prompt
    const checkIOSInstallPrompt = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
      const isInStandaloneMode = (window.navigator as any).standalone === true

      if (isIOS && isSafari && !isInStandaloneMode) {
        // Show iOS install instructions
        setIsInstallable(true)
      }
    }

    checkStandalone()
    registerServiceWorker()
    checkIOSInstallPrompt()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = async (): Promise<boolean> => {
    if (!installPrompt) {
      return false
    }

    try {
      await installPrompt.prompt()
      const choiceResult = await installPrompt.userChoice

      if (choiceResult.outcome === 'accepted') {
        trackEvent('pwa_install_accepted')
        setIsInstalled(true)
        setInstallPrompt(null)
        setIsInstallable(false)
        return true
      } else {
        trackEvent('pwa_install_dismissed')
        return false
      }
    } catch (error) {
      console.error('Error installing PWA:', error)
      trackEvent('pwa_install_error', { error: error.message })
      return false
    }
  }

  const dismissInstallPrompt = () => {
    setInstallPrompt(null)
    setIsInstallable(false)
    trackEvent('pwa_install_prompt_dismissed')
  }

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    installPrompt,
    install,
    dismissInstallPrompt
  }
}

// Hook for managing offline status
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        trackEvent('connectivity_restored')
        setWasOffline(false)
        
        // Trigger background sync
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
          navigator.serviceWorker.ready.then((registration) => {
            return registration.sync.register('document-sync')
          }).catch((error) => {
            console.error('Background sync registration failed:', error)
          })
        }
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
      trackEvent('connectivity_lost')
    }

    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  return { isOnline, wasOffline }
}

// Hook for managing push notifications
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window)
    
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission === 'granted') {
        trackEvent('push_notifications_enabled')
        return true
      } else {
        trackEvent('push_notifications_denied')
        return false
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      trackEvent('push_notifications_error', { error: error.message })
      return false
    }
  }

  const subscribeToPush = async (): Promise<PushSubscription | null> => {
    if (!isSupported || permission !== 'granted') {
      return null
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY
      })

      trackEvent('push_subscription_created')
      return subscription
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      trackEvent('push_subscription_error', { error: error.message })
      return null
    }
  }

  const unsubscribeFromPush = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        trackEvent('push_subscription_cancelled')
        return true
      }

      return false
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      return false
    }
  }

  return {
    permission,
    isSupported,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush
  }
}