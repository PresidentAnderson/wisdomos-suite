// WisdomOS Unified Navigation System
// Supports iOS, Android, Web, and SaaS platforms

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  platform?: ('ios' | 'android' | 'web' | 'saas' | 'all')[];
  subItems?: MenuItem[];
  badge?: number | string;
  permissions?: string[];
  action?: () => void;
}

export interface NavigationConfig {
  mainMenu: MenuItem[];
  quickActions: MenuItem[];
  userMenu: MenuItem[];
  adminMenu?: MenuItem[];
}

export const NAVIGATION_STRUCTURE: NavigationConfig = {
  mainMenu: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'Home',
      path: '/',
      platform: ['all'],
      subItems: [
        {
          id: 'overview',
          label: 'Overview',
          icon: 'LayoutDashboard',
          path: '/dashboard',
          platform: ['all']
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: 'BarChart3',
          path: '/dashboard/analytics',
          platform: ['all']
        },
        {
          id: 'insights',
          label: 'AI Insights',
          icon: 'Brain',
          path: '/dashboard/insights',
          platform: ['web', 'saas']
        }
      ]
    },
    {
      id: 'wisdom-tracking',
      label: 'Wisdom Tracking',
      icon: 'BookOpen',
      path: '/wisdom',
      platform: ['all'],
      subItems: [
        {
          id: 'daily-wisdom',
          label: 'Daily Wisdom',
          icon: 'Calendar',
          path: '/wisdom/daily',
          platform: ['all']
        },
        {
          id: 'wisdom-journal',
          label: 'Journal',
          icon: 'PenTool',
          path: '/wisdom/journal',
          platform: ['all']
        },
        {
          id: 'wisdom-metrics',
          label: 'Metrics',
          icon: 'TrendingUp',
          path: '/wisdom/metrics',
          platform: ['all']
        },
        {
          id: 'wisdom-goals',
          label: 'Goals',
          icon: 'Target',
          path: '/wisdom/goals',
          platform: ['all']
        }
      ]
    },
    {
      id: 'contributions',
      label: 'Contributions',
      icon: 'Users',
      path: '/contributions',
      platform: ['all'],
      subItems: [
        {
          id: 'contribution-display',
          label: 'My Display',
          icon: 'Layout',
          path: '/contributions/display',
          platform: ['all']
        },
        {
          id: 'contribution-feedback',
          label: 'Feedback',
          icon: 'MessageSquare',
          path: '/contributions/feedback',
          platform: ['all']
        },
        {
          id: 'contribution-recognition',
          label: 'Recognition',
          icon: 'Award',
          path: '/contributions/recognition',
          platform: ['all']
        },
        {
          id: 'contribution-export',
          label: 'Export',
          icon: 'Download',
          path: '/contributions/export',
          platform: ['web', 'saas']
        }
      ]
    },
    {
      id: 'autobiography',
      label: 'Autobiography',
      icon: 'Book',
      path: '/autobiography',
      platform: ['all'],
      subItems: [
        {
          id: 'timeline',
          label: 'Timeline',
          icon: 'Clock',
          path: '/autobiography/timeline',
          platform: ['all']
        },
        {
          id: 'milestones',
          label: 'Milestones',
          icon: 'Flag',
          path: '/autobiography/milestones',
          platform: ['all']
        },
        {
          id: 'reframing',
          label: 'Reframing',
          icon: 'RefreshCw',
          path: '/autobiography/reframing',
          platform: ['all']
        },
        {
          id: 'chapters',
          label: 'Chapters',
          icon: 'FileText',
          path: '/autobiography/chapters',
          platform: ['all']
        },
        {
          id: 'media',
          label: 'Media Gallery',
          icon: 'Image',
          path: '/autobiography/media',
          platform: ['all']
        }
      ]
    },
    {
      id: 'legacy',
      label: 'Legacy Vault',
      icon: 'Lock',
      path: '/legacy',
      platform: ['all'],
      subItems: [
        {
          id: 'vault-items',
          label: 'Vault Items',
          icon: 'Archive',
          path: '/legacy/vault',
          platform: ['all']
        },
        {
          id: 'time-capsules',
          label: 'Time Capsules',
          icon: 'Package',
          path: '/legacy/capsules',
          platform: ['all']
        },
        {
          id: 'beneficiaries',
          label: 'Beneficiaries',
          icon: 'UserCheck',
          path: '/legacy/beneficiaries',
          platform: ['all']
        },
        {
          id: 'access-rules',
          label: 'Access Rules',
          icon: 'Shield',
          path: '/legacy/rules',
          platform: ['web', 'saas']
        },
        {
          id: 'emergency-access',
          label: 'Emergency Access',
          icon: 'AlertTriangle',
          path: '/legacy/emergency',
          platform: ['all']
        }
      ]
    },
    {
      id: 'community',
      label: 'Community',
      icon: 'Users2',
      path: '/community',
      platform: ['all'],
      subItems: [
        {
          id: 'wisdom-circles',
          label: 'Wisdom Circles',
          icon: 'Circle',
          path: '/community/circles',
          platform: ['all']
        },
        {
          id: 'discussions',
          label: 'Discussions',
          icon: 'MessageCircle',
          path: '/community/discussions',
          platform: ['all']
        },
        {
          id: 'mentorship',
          label: 'Mentorship',
          icon: 'GraduationCap',
          path: '/community/mentorship',
          platform: ['all']
        },
        {
          id: 'events',
          label: 'Events',
          icon: 'CalendarDays',
          path: '/community/events',
          platform: ['all']
        },
        {
          id: 'resources',
          label: 'Resources',
          icon: 'Library',
          path: '/community/resources',
          platform: ['all']
        }
      ]
    },
    {
      id: 'gamification',
      label: 'Achievements',
      icon: 'Trophy',
      path: '/achievements',
      platform: ['all'],
      subItems: [
        {
          id: 'badges',
          label: 'Badges',
          icon: 'Medal',
          path: '/achievements/badges',
          platform: ['all']
        },
        {
          id: 'streaks',
          label: 'Streaks',
          icon: 'Flame',
          path: '/achievements/streaks',
          platform: ['all']
        },
        {
          id: 'leaderboard',
          label: 'Leaderboard',
          icon: 'Trophy',
          path: '/achievements/leaderboard',
          platform: ['all']
        },
        {
          id: 'challenges',
          label: 'Challenges',
          icon: 'Zap',
          path: '/achievements/challenges',
          platform: ['all']
        }
      ]
    },
    {
      id: 'sync',
      label: 'Sync & Backup',
      icon: 'Cloud',
      path: '/sync',
      platform: ['all'],
      subItems: [
        {
          id: 'sync-status',
          label: 'Sync Status',
          icon: 'RefreshCw',
          path: '/sync/status',
          platform: ['all']
        },
        {
          id: 'backup',
          label: 'Backup',
          icon: 'HardDrive',
          path: '/sync/backup',
          platform: ['all']
        },
        {
          id: 'export-data',
          label: 'Export Data',
          icon: 'Download',
          path: '/sync/export',
          platform: ['all']
        },
        {
          id: 'import-data',
          label: 'Import Data',
          icon: 'Upload',
          path: '/sync/import',
          platform: ['web', 'saas']
        },
        {
          id: 'connected-devices',
          label: 'Devices',
          icon: 'Smartphone',
          path: '/sync/devices',
          platform: ['all']
        }
      ]
    }
  ],
  
  quickActions: [
    {
      id: 'quick-wisdom',
      label: 'Quick Wisdom Entry',
      icon: 'Plus',
      path: '/quick/wisdom',
      platform: ['all']
    },
    {
      id: 'quick-milestone',
      label: 'Add Milestone',
      icon: 'Flag',
      path: '/quick/milestone',
      platform: ['all']
    },
    {
      id: 'quick-contribution',
      label: 'Add Contribution',
      icon: 'Heart',
      path: '/quick/contribution',
      platform: ['all']
    },
    {
      id: 'quick-vault',
      label: 'Add to Vault',
      icon: 'Lock',
      path: '/quick/vault',
      platform: ['all']
    }
  ],
  
  userMenu: [
    {
      id: 'profile',
      label: 'Profile',
      icon: 'User',
      path: '/profile',
      platform: ['all'],
      subItems: [
        {
          id: 'profile-view',
          label: 'View Profile',
          icon: 'Eye',
          path: '/profile/view',
          platform: ['all']
        },
        {
          id: 'profile-edit',
          label: 'Edit Profile',
          icon: 'Edit',
          path: '/profile/edit',
          platform: ['all']
        },
        {
          id: 'profile-privacy',
          label: 'Privacy Settings',
          icon: 'Lock',
          path: '/profile/privacy',
          platform: ['all']
        }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'Settings',
      path: '/settings',
      platform: ['all'],
      subItems: [
        {
          id: 'settings-general',
          label: 'General',
          icon: 'Sliders',
          path: '/settings/general',
          platform: ['all']
        },
        {
          id: 'settings-notifications',
          label: 'Notifications',
          icon: 'Bell',
          path: '/settings/notifications',
          platform: ['all']
        },
        {
          id: 'settings-security',
          label: 'Security',
          icon: 'Shield',
          path: '/settings/security',
          platform: ['all']
        },
        {
          id: 'settings-billing',
          label: 'Billing',
          icon: 'CreditCard',
          path: '/settings/billing',
          platform: ['web', 'saas']
        }
      ]
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: 'HelpCircle',
      path: '/help',
      platform: ['all']
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: 'LogOut',
      platform: ['all'],
      action: () => console.log('Logout action')
    }
  ],
  
  adminMenu: [
    {
      id: 'admin-dashboard',
      label: 'Admin Dashboard',
      icon: 'Shield',
      path: '/admin',
      platform: ['saas'],
      permissions: ['admin'],
      subItems: [
        {
          id: 'admin-users',
          label: 'User Management',
          icon: 'Users',
          path: '/admin/users',
          platform: ['saas']
        },
        {
          id: 'admin-analytics',
          label: 'Platform Analytics',
          icon: 'BarChart',
          path: '/admin/analytics',
          platform: ['saas']
        },
        {
          id: 'admin-billing',
          label: 'Billing Management',
          icon: 'DollarSign',
          path: '/admin/billing',
          platform: ['saas']
        },
        {
          id: 'admin-content',
          label: 'Content Moderation',
          icon: 'FileCheck',
          path: '/admin/content',
          platform: ['saas']
        },
        {
          id: 'admin-system',
          label: 'System Settings',
          icon: 'Server',
          path: '/admin/system',
          platform: ['saas']
        }
      ]
    }
  ]
};

// Platform-specific navigation filtering
export function getNavigationForPlatform(
  platform: 'ios' | 'android' | 'web' | 'saas',
  userPermissions: string[] = []
): NavigationConfig {
  const filterMenu = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => {
        // Check platform compatibility
        if (item.platform && !item.platform.includes('all') && !item.platform.includes(platform)) {
          return false;
        }
        
        // Check permissions
        if (item.permissions && !item.permissions.every(p => userPermissions.includes(p))) {
          return false;
        }
        
        return true;
      })
      .map(item => ({
        ...item,
        subItems: item.subItems ? filterMenu(item.subItems) : undefined
      }));
  };
  
  return {
    mainMenu: filterMenu(NAVIGATION_STRUCTURE.mainMenu),
    quickActions: filterMenu(NAVIGATION_STRUCTURE.quickActions),
    userMenu: filterMenu(NAVIGATION_STRUCTURE.userMenu),
    adminMenu: NAVIGATION_STRUCTURE.adminMenu ? filterMenu(NAVIGATION_STRUCTURE.adminMenu) : undefined
  };
}

// Deep link generator for mobile platforms
export function generateDeepLink(
  path: string,
  platform: 'ios' | 'android'
): string {
  const scheme = platform === 'ios' ? 'wisdomos://' : 'wisdomos://';
  return `${scheme}${path.replace(/^\//, '')}`;
}

// Navigation state manager
export class NavigationManager {
  private currentPath: string = '/';
  private history: string[] = [];
  private platform: 'ios' | 'android' | 'web' | 'saas';
  
  constructor(platform: 'ios' | 'android' | 'web' | 'saas') {
    this.platform = platform;
  }
  
  navigate(path: string): void {
    this.history.push(this.currentPath);
    this.currentPath = path;
    
    // Platform-specific navigation
    if (this.platform === 'web' || this.platform === 'saas') {
      window.history.pushState({}, '', path);
    } else {
      // For mobile platforms, trigger native navigation
      this.triggerNativeNavigation(path);
    }
  }
  
  back(): void {
    const previousPath = this.history.pop();
    if (previousPath) {
      this.currentPath = previousPath;
      
      if (this.platform === 'web' || this.platform === 'saas') {
        window.history.back();
      } else {
        this.triggerNativeNavigation(previousPath);
      }
    }
  }
  
  private triggerNativeNavigation(path: string): void {
    // This would be implemented in React Native
    console.log(`Navigate to: ${path} on ${this.platform}`);
  }
  
  getCurrentPath(): string {
    return this.currentPath;
  }
  
  getBreadcrumbs(): string[] {
    return [...this.history, this.currentPath];
  }
}