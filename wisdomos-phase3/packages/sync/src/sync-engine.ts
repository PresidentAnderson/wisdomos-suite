// WisdomOS Cross-Platform Sync Engine
// Handles real-time data synchronization across iOS, Android, Web, and SaaS

import { EventEmitter } from 'events';

export interface SyncConfig {
  platform: 'ios' | 'android' | 'web' | 'saas';
  userId: string;
  deviceId: string;
  apiUrl: string;
  wsUrl: string;
  syncInterval?: number; // in milliseconds
  offlineMode?: boolean;
  encryptionKey?: string;
}

export interface SyncItem {
  id: string;
  type: 'wisdom' | 'contribution' | 'autobiography' | 'legacy' | 'achievement' | 'settings';
  data: any;
  timestamp: number;
  version: number;
  checksum: string;
  platform: string;
  deviceId: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number;
  pendingChanges: number;
  syncErrors: SyncError[];
  connectedDevices: DeviceInfo[];
}

export interface DeviceInfo {
  id: string;
  name: string;
  platform: 'ios' | 'android' | 'web' | 'saas';
  lastSeen: number;
  syncStatus: 'synced' | 'syncing' | 'pending' | 'error';
}

export interface SyncError {
  timestamp: number;
  type: string;
  message: string;
  itemId?: string;
  retryCount: number;
}

export interface DataMigrationPath {
  from: string;
  to: string;
  transform: (data: any) => any;
  validate: (data: any) => boolean;
}

export class SyncEngine extends EventEmitter {
  private config: SyncConfig;
  private ws: WebSocket | null = null;
  private syncQueue: SyncItem[] = [];
  private syncStatus: SyncStatus;
  private retryTimeout: NodeJS.Timeout | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private conflictResolver: ConflictResolver;
  private dataCache: Map<string, SyncItem> = new Map();
  
  constructor(config: SyncConfig) {
    super();
    this.config = config;
    this.conflictResolver = new ConflictResolver();
    this.syncStatus = {
      isOnline: false,
      isSyncing: false,
      lastSyncTime: 0,
      pendingChanges: 0,
      syncErrors: [],
      connectedDevices: []
    };
    
    this.initialize();
  }
  
  private async initialize(): Promise<void> {
    // Load cached data if offline
    if (this.config.offlineMode) {
      await this.loadOfflineCache();
    }
    
    // Connect to WebSocket for real-time sync
    this.connectWebSocket();
    
    // Set up periodic sync
    if (this.config.syncInterval) {
      this.syncInterval = setInterval(() => {
        this.performSync();
      }, this.config.syncInterval);
    }
    
    // Listen for network changes
    this.setupNetworkListener();
  }
  
  private connectWebSocket(): void {
    try {
      this.ws = new WebSocket(this.config.wsUrl);
      
      this.ws.onopen = () => {
        this.syncStatus.isOnline = true;
        this.emit('connected');
        this.performInitialSync();
      };
      
      this.ws.onmessage = (event) => {
        this.handleIncomingSync(JSON.parse(event.data));
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.handleConnectionError();
      };
      
      this.ws.onclose = () => {
        this.syncStatus.isOnline = false;
        this.emit('disconnected');
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.handleConnectionError();
    }
  }
  
  private handleIncomingSync(data: any): void {
    switch (data.type) {
      case 'sync':
        this.processSyncData(data.items);
        break;
      case 'conflict':
        this.handleConflict(data.conflict);
        break;
      case 'device-update':
        this.updateConnectedDevices(data.devices);
        break;
      case 'notification':
        this.emit('notification', data.message);
        break;
    }
  }
  
  private async processSyncData(items: SyncItem[]): Promise<void> {
    for (const item of items) {
      const existingItem = this.dataCache.get(item.id);
      
      if (!existingItem || item.version > existingItem.version) {
        // Update local cache
        this.dataCache.set(item.id, item);
        
        // Emit event for UI update
        this.emit('data-updated', item);
        
        // Store in local database
        await this.storeLocally(item);
      } else if (item.version < existingItem.version) {
        // We have a newer version, push it
        this.queueForSync(existingItem);
      } else if (item.checksum !== existingItem.checksum) {
        // Conflict detected
        const resolved = await this.conflictResolver.resolve(existingItem, item);
        this.dataCache.set(item.id, resolved);
        this.queueForSync(resolved);
      }
    }
  }
  
  public async syncData(type: string, data: any): Promise<void> {
    const syncItem: SyncItem = {
      id: this.generateId(),
      type: type as any,
      data,
      timestamp: Date.now(),
      version: 1,
      checksum: this.calculateChecksum(data),
      platform: this.config.platform,
      deviceId: this.config.deviceId
    };
    
    // Add to cache
    this.dataCache.set(syncItem.id, syncItem);
    
    // Queue for sync
    this.queueForSync(syncItem);
    
    // Store locally first
    await this.storeLocally(syncItem);
    
    // Attempt immediate sync if online
    if (this.syncStatus.isOnline) {
      await this.performSync();
    }
  }
  
  private queueForSync(item: SyncItem): void {
    this.syncQueue.push(item);
    this.syncStatus.pendingChanges = this.syncQueue.length;
    this.emit('pending-changes', this.syncStatus.pendingChanges);
  }
  
  private async performSync(): Promise<void> {
    if (this.syncStatus.isSyncing || this.syncQueue.length === 0) {
      return;
    }
    
    this.syncStatus.isSyncing = true;
    this.emit('sync-started');
    
    try {
      const batch = this.syncQueue.splice(0, 50); // Process in batches
      
      const response = await fetch(`${this.config.apiUrl}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': this.config.userId,
          'X-Device-ID': this.config.deviceId,
          'X-Platform': this.config.platform
        },
        body: JSON.stringify({ items: batch })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Process any returned sync items
        if (result.items) {
          await this.processSyncData(result.items);
        }
        
        this.syncStatus.lastSyncTime = Date.now();
        this.syncStatus.pendingChanges = this.syncQueue.length;
        this.emit('sync-completed', result);
      } else {
        // Re-queue failed items
        this.syncQueue.unshift(...batch);
        throw new Error(`Sync failed: ${response.status}`);
      }
    } catch (error) {
      this.handleSyncError(error);
    } finally {
      this.syncStatus.isSyncing = false;
    }
  }
  
  private async performInitialSync(): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiUrl}/sync/initial`, {
        method: 'GET',
        headers: {
          'X-User-ID': this.config.userId,
          'X-Device-ID': this.config.deviceId,
          'X-Platform': this.config.platform
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        await this.processSyncData(data.items);
        this.updateConnectedDevices(data.devices);
      }
    } catch (error) {
      console.error('Initial sync failed:', error);
    }
  }
  
  private async handleConflict(conflict: any): Promise<void> {
    try {
      const resolved = await this.conflictResolver.resolve(conflict.local, conflict.remote);
      this.dataCache.set(resolved.id, resolved);
      this.queueForSync(resolved);
      this.emit('conflict-resolved', resolved);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      this.emit('conflict-error', { conflict, error });
    }
  }

  private updateConnectedDevices(devices: DeviceInfo[]): void {
    this.syncStatus.connectedDevices = devices;
    this.emit('devices-updated', devices);
  }
  
  private handleSyncError(error: any): void {
    const syncError: SyncError = {
      timestamp: Date.now(),
      type: 'sync',
      message: error.message || 'Unknown sync error',
      retryCount: 0
    };
    
    this.syncStatus.syncErrors.push(syncError);
    this.emit('sync-error', syncError);
    
    // Implement exponential backoff for retries
    this.scheduleRetry(syncError);
  }
  
  private scheduleRetry(error: SyncError): void {
    const delay = Math.min(1000 * Math.pow(2, error.retryCount), 30000);
    
    setTimeout(() => {
      error.retryCount++;
      this.performSync();
    }, delay);
  }
  
  private scheduleReconnect(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    
    this.retryTimeout = setTimeout(() => {
      this.connectWebSocket();
    }, 5000);
  }
  
  private handleConnectionError(): void {
    this.syncStatus.isOnline = false;
    this.emit('connection-error');
    this.scheduleReconnect();
  }
  
  private setupNetworkListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.syncStatus.isOnline = true;
        this.connectWebSocket();
        this.performSync();
      });
      
      window.addEventListener('offline', () => {
        this.syncStatus.isOnline = false;
        this.emit('offline');
      });
    }
  }
  
  private async loadOfflineCache(): Promise<void> {
    // Load from IndexedDB/SQLite depending on platform
    const cached = await this.getLocalStorage();
    cached.forEach(item => {
      this.dataCache.set(item.id, item);
    });
  }
  
  private async storeLocally(item: SyncItem): Promise<void> {
    // Platform-specific storage
    if (this.config.platform === 'web' || this.config.platform === 'saas') {
      // Use IndexedDB
      await this.storeInIndexedDB(item);
    } else {
      // Use SQLite for mobile
      await this.storeInSQLite(item);
    }
  }
  
  private async storeInIndexedDB(item: SyncItem): Promise<void> {
    // IndexedDB implementation
    const db = await this.openIndexedDB();
    const transaction = db.transaction(['sync_items'], 'readwrite');
    const store = transaction.objectStore('sync_items');
    store.put(item);
  }
  
  private async storeInSQLite(item: SyncItem): Promise<void> {
    // SQLite implementation for React Native
    console.log('Storing in SQLite:', item);
  }
  
  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('WisdomOS', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('sync_items')) {
          db.createObjectStore('sync_items', { keyPath: 'id' });
        }
      };
    });
  }
  
  private async getLocalStorage(): Promise<SyncItem[]> {
    if (this.config.platform === 'web' || this.config.platform === 'saas') {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['sync_items'], 'readonly');
      const store = transaction.objectStore('sync_items');
      
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
      });
    } else {
      // Mobile SQLite implementation
      return [];
    }
  }
  
  private generateId(): string {
    return `${this.config.platform}_${this.config.deviceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private calculateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
  
  // Public API methods
  
  public getStatus(): SyncStatus {
    return this.syncStatus;
  }
  
  public async forceSync(): Promise<void> {
    await this.performSync();
  }
  
  public async exportData(format: 'json' | 'csv' | 'pdf'): Promise<Blob> {
    const data = Array.from(this.dataCache.values());
    
    switch (format) {
      case 'json':
        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      case 'csv':
        return this.convertToCSV(data);
      case 'pdf':
        return this.generatePDF(data);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
  
  public async importData(file: File): Promise<void> {
    const text = await file.text();
    const data = JSON.parse(text);
    
    for (const item of data) {
      await this.syncData(item.type, item.data);
    }
  }
  
  private convertToCSV(data: SyncItem[]): Blob {
    // CSV conversion logic
    const csv = data.map(item => {
      return `${item.id},${item.type},${item.timestamp},${item.platform}`;
    }).join('\n');
    
    return new Blob([csv], { type: 'text/csv' });
  }
  
  private generatePDF(data: SyncItem[]): Blob {
    // PDF generation would use a library like jsPDF
    const pdfContent = JSON.stringify(data);
    return new Blob([pdfContent], { type: 'application/pdf' });
  }
  
  public destroy(): void {
    if (this.ws) {
      this.ws.close();
    }
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    
    this.removeAllListeners();
  }
}

// Conflict Resolution Strategy
class ConflictResolver {
  async resolve(local: SyncItem, remote: SyncItem): Promise<SyncItem> {
    // Implement conflict resolution strategies
    
    // Strategy 1: Last Write Wins
    if (local.timestamp > remote.timestamp) {
      return local;
    } else if (remote.timestamp > local.timestamp) {
      return remote;
    }
    
    // Strategy 2: Merge if possible
    if (this.canMerge(local.type)) {
      return this.merge(local, remote);
    }
    
    // Strategy 3: User choice (would show UI)
    return local; // Default to local for now
  }
  
  private canMerge(type: string): boolean {
    // Define which types can be merged
    return ['settings', 'contribution'].includes(type);
  }
  
  private merge(local: SyncItem, remote: SyncItem): SyncItem {
    // Implement merge logic based on type
    return {
      ...local,
      data: { ...remote.data, ...local.data },
      version: Math.max(local.version, remote.version) + 1,
      timestamp: Date.now()
    };
  }
}

// Data Migration Manager
export class DataMigrationManager {
  private migrations: DataMigrationPath[] = [];
  
  registerMigration(migration: DataMigrationPath): void {
    this.migrations.push(migration);
  }
  
  async migrate(data: any, fromVersion: string, toVersion: string): Promise<any> {
    const path = this.findMigrationPath(fromVersion, toVersion);
    
    if (!path) {
      throw new Error(`No migration path from ${fromVersion} to ${toVersion}`);
    }
    
    let result = data;
    for (const migration of path) {
      if (!migration.validate(result)) {
        throw new Error(`Data validation failed for migration ${migration.from} to ${migration.to}`);
      }
      result = migration.transform(result);
    }
    
    return result;
  }
  
  private findMigrationPath(from: string, to: string): DataMigrationPath[] | null {
    // Simple path finding - could be optimized with graph algorithms
    const path: DataMigrationPath[] = [];
    let current = from;
    
    while (current !== to) {
      const migration = this.migrations.find(m => m.from === current);
      if (!migration) {
        return null;
      }
      path.push(migration);
      current = migration.to;
    }
    
    return path;
  }
}

// Export singleton instance
export const syncEngine = (config: SyncConfig) => new SyncEngine(config);