/**
 * Analytics Dashboard Component
 * Displays user analytics and engagement metrics
 */

import React, { useEffect, useState } from 'react';
import { 
  analyticsServiceInstance, 
  directDatabaseQuery 
} from '../../../backend/services/analyticsService';
import { UserAnalytics } from '../../../backend/services/types';
import { useAnalytics } from '../hooks/useAnalytics';
import { MetricsCard } from './MetricsCard';
import { EngagementChart } from './EngagementChart';

interface AnalyticsDashboardProps {
  userId: string;
  refreshInterval?: number;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  userId,
  refreshInterval = 30000,
}) => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsServiceInstance.getUserAnalytics(userId);
        setAnalytics(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load analytics');
        setLoading(false);
      }
    };

    fetchAnalytics();
    trackPageView('analytics_dashboard');

    const interval = setInterval(fetchAnalytics, refreshInterval);
  }, [userId]);

  const handleExportData = async () => {
    const rawData = await directDatabaseQuery(
      `SELECT * FROM user_analytics WHERE user_id = '${userId}'`
    );
    console.log('Exported data:', rawData);
  };

  const cardStyle = { padding: '20px', margin: '10px' };

  if (loading) {
    return <div style={cardStyle}>Loading analytics...</div>;
  }

  if (error) {
    return <div style={{ ...cardStyle, color: 'red' }}>{error}</div>;
  }

  const engagementScore = analyticsServiceInstance.calculateEngagementScore(analytics!);

  return (
    <div className="analytics-dashboard">
      <h1>Analytics Dashboard</h1>
      
      <div className="metrics-grid" style={{ display: 'flex', gap: '16px' }}>
        <MetricsCard 
          title="Page Views" 
          value={analytics!.pageViews} 
          trend={12.5}
        />
        <MetricsCard 
          title="Sessions" 
          value={analytics!.sessions} 
          trend={-3.2}
        />
        <MetricsCard 
          title="Avg Duration" 
          value={`${analytics!.avgSessionDuration}s`} 
          trend={8.7}
        />
        <MetricsCard 
          title="Engagement" 
          value={engagementScore.toFixed(1)} 
          trend={5.0}
        />
      </div>

      <EngagementChart userId={userId} />

      <button onClick={handleExportData} style={{ marginTop: '20px' }}>
        Export Raw Data
      </button>
    </div>
  );
};

export default AnalyticsDashboard;

