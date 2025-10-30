'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  canShare: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
}

export function usePWA() {
  const [pwaState, setPWAState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true,
    isStandalone: false,
    canShare: false,
    deferredPrompt: null
  });

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');

    // Check if Web Share API is supported
    const canShare = 'share' in navigator;

    // Check online status
    const isOnline = navigator.onLine;

    setPWAState(prev => ({
      ...prev,
      isStandalone,
      canShare,
      isOnline,
      isInstalled: isStandalone
    }));

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      
      setPWAState(prev => ({
        ...prev,
        isInstallable: true,
        deferredPrompt: event
      }));
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setPWAState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        deferredPrompt: null
      }));
    };

    // Listen for online/offline events
    const handleOnline = () => {
      setPWAState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setPWAState(prev => ({ ...prev, isOnline: false }));
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker and check for updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'CACHE_STATUS') {
          console.log('Cache status:', event.data);
        }
      });
    }
  }, []);

  const installApp = useCallback(async () => {
    if (!pwaState.deferredPrompt) return false;

    setInstalling(true);

    try {
      await pwaState.deferredPrompt.prompt();
      const { outcome } = await pwaState.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setPWAState(prev => ({
          ...prev,
          isInstallable: false,
          deferredPrompt: null
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Installation failed:', error);
      return false;
    } finally {
      setInstalling(false);
    }
  }, [pwaState.deferredPrompt]);

  const shareContent = useCallback(async (data: {
    title?: string;
    text?: string;
    url?: string;
    files?: File[];
  }) => {
    if (!pwaState.canShare) return false;

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('Sharing failed:', error);
      return false;
    }
  }, [pwaState.canShare]);

  const updateApp = useCallback(async () => {
    if (!updateAvailable) return;

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.update();
        
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }
      
      // Reload to activate new service worker
      window.location.reload();
    } catch (error) {
      console.error('Update failed:', error);
    }
  }, [updateAvailable]);

  const clearCache = useCallback(async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Unregister service worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
      }
      
      console.log('Cache cleared successfully');
      return true;
    } catch (error) {
      console.error('Cache clearing failed:', error);
      return false;
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;

    if (Notification.permission === 'granted') return true;

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  const subscribeToNotifications = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });
      
      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
      
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }, []);

  const addToHomeScreen = useCallback(() => {
    // For iOS Safari
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      return {
        canAdd: true,
        instructions: 'Tap the share button and then "Add to Home Screen"'
      };
    }
    
    // For other browsers with install prompt
    if (pwaState.isInstallable) {
      return {
        canAdd: true,
        instructions: 'Click the install button to add to your home screen'
      };
    }
    
    return {
      canAdd: false,
      instructions: 'App installation not available on this device'
    };
  }, [pwaState.isInstallable]);

  // Storage quota management
  const checkStorageQuota = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota,
          usage: estimate.usage,
          available: (estimate.quota || 0) - (estimate.usage || 0),
          percentUsed: ((estimate.usage || 0) / (estimate.quota || 1)) * 100
        };
      } catch (error) {
        console.error('Storage quota check failed:', error);
      }
    }
    return null;
  }, []);

  return {
    ...pwaState,
    updateAvailable,
    installing,
    installApp,
    shareContent,
    updateApp,
    clearCache,
    requestNotificationPermission,
    subscribeToNotifications,
    addToHomeScreen,
    checkStorageQuota
  };
}