"use client"

import ServiceCard from './ServiceCard';

interface Service {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  averageRating: any;
  totalBookings: number;
  category?: {
    name: string;
  } | null;
  provider?: {
    displayName: string | null;
    isVerified: boolean;
  } | null;
}

interface ServiceGridProps {
  services: Service[];
}

export default function ServiceGrid({ services }: ServiceGridProps) {
  if (services.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
