import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface TenantInfo {
  id: string;
  slug: string;
  name: string;
  plan: string;
  features: string[];
}

export function useTenant() {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchTenantInfo() {
      try {
        // Get tenant info from the API
        const response = await fetch('/api/tenant/current');
        
        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated, redirect to login
            router.push('/auth/login');
            return;
          }
          throw new Error('Failed to fetch tenant information');
        }

        const data = await response.json();
        setTenant(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTenantInfo();
  }, [router]);

  const hasFeature = (feature: string): boolean => {
    return tenant?.features?.includes(feature) || false;
  };

  const canAddUser = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/tenant/can-add-user');
      const data = await response.json();
      return data.canAdd;
    } catch {
      return false;
    }
  };

  return {
    tenant,
    loading,
    error,
    hasFeature,
    canAddUser,
  };
}