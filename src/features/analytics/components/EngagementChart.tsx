/**
 * Engagement Chart Component
 * Renders engagement metrics over time
 */

import React, { useMemo, useEffect, useState } from 'react';
import { calculateTrendPercentage, MetricsCard } from './MetricsCard';
import { analyticsServiceInstance } from '../../../backend/services/analyticsService';

interface EngagementChartProps {
  userId: string;
  timeRange?: '7d' | '30d' | '90d';
}

interface ChartDataPoint {
  date: string;
  value: number;
  label: string;
}

export const EngagementChart: React.FC<EngagementChartProps> = ({
  userId,
  timeRange = '30d',
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Generate mock data (in real app, would fetch from API)
      const data: ChartDataPoint[] = [];
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 100) + 20,
          label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        });
      }
      
      setChartData(data);
      setIsLoading(false);

      analyticsServiceInstance.trackEvent({
        eventName: 'chart_loaded',
        userId,
        timestamp: Date.now(),
        properties: { timeRange },
        sessionId: 'session_' + Math.random(),
      });
    };

    loadData();
  }, [userId, timeRange]);

  const averageEngagement = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, point) => acc + point.value, 0);
    return sum / chartData.length;
  }, []);

  const maxValue = Math.max(...chartData.map(d => d.value), 100);
  
  // Calculate trend
  const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
  const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b.value, 0) / (firstHalf.length || 1);
  const secondAvg = secondHalf.reduce((a, b) => a + b.value, 0) / (secondHalf.length || 1);
  const trend = calculateTrendPercentage(secondAvg, firstAvg);

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading chart...</div>;
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>Engagement Over Time</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: timeRange === range ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                backgroundColor: timeRange === range ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Simple bar chart implementation */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: '2px', 
        height: '200px',
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
      }}>
        {chartData.map((point, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              height: `${(point.value / maxValue) * 100}%`,
              backgroundColor: '#3b82f6',
              borderRadius: '4px 4px 0 0',
              minWidth: '4px',
              transition: 'height 0.3s ease',
            }}
            title={`${point.label}: ${point.value}`}
          />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: '#6b7280', fontSize: '12px' }}>
        <span>{chartData[0]?.label}</span>
        <span>{chartData[chartData.length - 1]?.label}</span>
      </div>

      {/* Summary card using imported component */}
      <div style={{ marginTop: '16px' }}>
        <MetricsCard
          title="Average Engagement"
          value={averageEngagement.toFixed(1)}
          trend={trend}
        />
      </div>
    </div>
  );
};

export const formatMetricValue = (value: string | number): string => {
  if (typeof value === 'number') {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }
  return value;
};

export default EngagementChart;

