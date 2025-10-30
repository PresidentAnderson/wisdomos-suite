import React from 'react';

export type TrackerStatus = 'green' | 'yellow' | 'red' | null;

interface StatusDotProps {
  status: TrackerStatus;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusDot({ status, onClick, size = 'md' }: StatusDotProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    green: 'bg-green-500 border-green-600',
    yellow: 'bg-yellow-500 border-yellow-600',
    red: 'bg-red-500 border-red-600',
    null: 'bg-gray-600 border-gray-700',
  };

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        ${sizeClasses[size]}
        ${colorClasses[status || 'null']}
        rounded-full border
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:scale-110 hover:shadow-lg' : 'cursor-default'}
        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-900 focus:ring-blue-500
      `}
      aria-label={`Status: ${status || 'unset'}`}
    />
  );
}