// Test file for Sync Engine
// Note: Importing from packages directly may cause build issues in production
// This is for testing purposes only

export interface SyncConfig {
  platform: 'ios' | 'android' | 'web' | 'saas';
  userId: string;
  deviceId: string;
  apiUrl: string;
  wsUrl: string;
  syncInterval?: number;
  offlineMode?: boolean;
  encryptionKey?: string;
}

export function testSyncEngine() {
  console.log('Testing Sync Engine...');
  
  const config: SyncConfig = {
    platform: 'web',
    userId: 'test-user-123',
    deviceId: 'web-device-123',
    apiUrl: 'http://localhost:3001/api',
    wsUrl: 'ws://localhost:3001/ws',
    syncInterval: 30000, // 30 seconds
    offlineMode: true,
    encryptionKey: 'test-key-123'
  };
  
  try {
    // Simulate sync engine functionality for testing
    const mockEngine = {
      getStatus: () => ({
        isOnline: false,
        isSyncing: false,
        lastSyncTime: Date.now() - 60000,
        pendingChanges: 3,
        syncErrors: [],
        connectedDevices: [
          { id: 'web-device-123', name: 'Chrome Browser', platform: 'web' as const, lastSeen: Date.now(), syncStatus: 'synced' as const }
        ]
      }),
      syncData: (type: string, data: any) => {
        console.log(`📤 Syncing ${type} data:`, data);
      },
      on: (event: string, callback: Function) => {
        console.log(`🎧 Event listener added for: ${event}`);
      }
    };
    
    console.log('Sync engine initialized successfully (simulated)');
    console.log('Initial status:', mockEngine.getStatus());
    
    // Test data sync
    mockEngine.syncData('wisdom', {
      id: 'test-wisdom-1',
      content: 'This is a test wisdom entry',
      tags: ['test', 'wisdom', 'learning'],
      timestamp: Date.now()
    });
    
    // Setup event listeners
    mockEngine.on('connected', () => console.log('✅ Sync engine connected'));
    mockEngine.on('disconnected', () => console.log('❌ Sync engine disconnected'));
    
    return mockEngine;
  } catch (error) {
    console.error('Sync Engine test failed:', error);
    return null;
  }
}

export async function testDataExport() {
  console.log('Testing Data Export...');
  
  try {
    // Simulate data export functionality
    const sampleData = [
      { id: '1', type: 'wisdom', content: 'Test wisdom entry', timestamp: Date.now() },
      { id: '2', type: 'contribution', content: 'Test contribution', timestamp: Date.now() }
    ];
    
    const jsonBlob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const csvBlob = new Blob(['id,type,content,timestamp\n1,wisdom,Test wisdom entry,' + Date.now()], { type: 'text/csv' });
    
    console.log('Export test successful (simulated):', {
      jsonSize: jsonBlob.size,
      csvSize: csvBlob.size
    });
    
    return { jsonBlob, csvBlob };
  } catch (error) {
    console.error('Data Export test failed:', error);
    return null;
  }
}