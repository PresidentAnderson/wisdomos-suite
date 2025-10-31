'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useTenant } from '@/hooks/use-tenant';

interface TenantContextType {
  tenantId?: string;
  tenantSlug?: string;
  tenantName?: string;
  tenantPlan?: string;
  features: string[];
  hasFeature: (feature: string) => boolean;
  loading: boolean;
}

const TenantContext = createContext<TenantContextType>({
  features: [],
  hasFeature: () => false,
  loading: true,
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const { tenant, loading, hasFeature } = useTenant();

  return (
    <TenantContext.Provider
      value={{
        tenantId: tenant?.id,
        tenantSlug: tenant?.slug,
        tenantName: tenant?.name,
        tenantPlan: tenant?.plan,
        features: tenant?.features || [],
        hasFeature,
        loading,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within TenantProvider');
  }
  return context;
}