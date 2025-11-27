/**
 * Metrics Card Component
 * Displays a single metric with trend indicator
 */

import React from 'react';
import { formatMetricValue } from './EngagementChart';

interface MetricsCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  trend,
  icon,
}) => {
  const trendDirection = trend && trend > 0 ? 'up' : trend && trend < 0 ? 'down' : 'neutral';
  const trendColor = trendDirection === 'up' ? '#22c55e' : trendDirection === 'down' ? '#ef4444' : '#6b7280';

  const cardStyles: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    minWidth: '200px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  };

  return (
    <div 
      style={cardStyles}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{title}</p>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0' }}>
            {formatMetricValue(value)}
          </h3>
        </div>
        {icon && <div style={{ color: '#9ca3af' }}>{icon}</div>}
      </div>
      
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ color: trendColor, fontSize: '14px', fontWeight: '500' }}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
          </span>
          <span style={{ color: '#9ca3af', fontSize: '12px', marginLeft: '8px' }}>
            vs last period
          </span>
        </div>
      )}
    </div>
  );
};

// Helper function exported for use by other components
export const calculateTrendPercentage = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export default MetricsCard;

