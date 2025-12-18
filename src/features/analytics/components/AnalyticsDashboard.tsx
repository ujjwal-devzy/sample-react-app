/**
 * Analytics Dashboard Component
 * Display analytics and metrics
 */

import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import type { DashboardMetrics } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/Card';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '../../../shared/components/Tabs';
import { Badge } from '../../../shared/components/Badge';
import { ProgressBar, ProgressRing } from '../../../shared/components/Progress';
import { SkeletonCard } from '../../../shared/components/Loading';
import { formatNumber } from '../../../core/utils/format';
import { WorkspaceInsights } from '../../workspace';

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      // Convert timeRange to DateRange
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      const data = await analyticsService.getDashboardMetrics({ startDate, endDate });
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  if (isLoading) {
    return (
      <div className="analytics-dashboard">
        <div className="analytics-header">
          <h1>Analytics</h1>
        </div>
        <div className="analytics-grid">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="analytics-dashboard">
        <div className="analytics-empty">
          <p>Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <div className="analytics-header-content">
          <h1 className="analytics-title">Analytics</h1>
          <p className="analytics-subtitle">Track your team's performance and progress</p>
        </div>
        <div className="analytics-time-range">
          {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
            <button
              key={range}
              className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <WorkspaceInsights />

      {/* Key Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Tasks"
          value={metrics.taskMetrics.total ?? 0}
          change={12}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          }
        />
        <MetricCard
          title="Completed"
          value={metrics.taskMetrics.completed ?? 0}
          change={8}
          variant="success"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />
        <MetricCard
          title="In Progress"
          value={metrics.taskMetrics.inProgress ?? 0}
          change={-3}
          variant="warning"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <MetricCard
          title="Overdue"
          value={metrics.taskMetrics.overdue ?? 0}
          change={2}
          variant="danger"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />
      </div>

      {/* Charts Section */}
      <div className="analytics-charts">
        <Tabs defaultTab="overview">
          <TabList>
            <Tab id="overview">Overview</Tab>
            <Tab id="productivity">Productivity</Tab>
            <Tab id="team">Team</Tab>
          </TabList>

          <TabPanels>
            <TabPanel id="overview">
              <div className="charts-grid">
                <Card className="chart-card">
                  <CardHeader>
                    <CardTitle>Task Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="completion-chart">
                      <ProgressRing
                        value={metrics.taskMetrics.completionRate ?? 0}
                        size={160}
                        strokeWidth={12}
                        variant="success"
                        label="Completed"
                      />
                      <div className="completion-stats">
                        <div className="completion-stat">
                          <span className="stat-label">This Week</span>
                          <span className="stat-value">{metrics.taskMetrics.completedThisWeek ?? 0}</span>
                        </div>
                        <div className="completion-stat">
                          <span className="stat-label">Avg. Time</span>
                          <span className="stat-value">2.3 days</span>
                        </div>
                        <div className="completion-stat">
                          <span className="stat-label">On Time</span>
                          <span className="stat-value">87%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="chart-card">
                  <CardHeader>
                    <CardTitle>Tasks by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="status-bars">
                      <StatusBar label="Backlog" value={metrics.taskMetrics.byStatusMap?.backlog ?? 0} total={metrics.taskMetrics.total ?? 0} color="var(--color-text-secondary)" />
                      <StatusBar label="To Do" value={metrics.taskMetrics.byStatusMap?.todo ?? 0} total={metrics.taskMetrics.total ?? 0} color="var(--color-neon-blue)" />
                      <StatusBar label="In Progress" value={metrics.taskMetrics.byStatusMap?.inProgress ?? 0} total={metrics.taskMetrics.total ?? 0} color="var(--color-neon-orange)" />
                      <StatusBar label="In Review" value={metrics.taskMetrics.byStatusMap?.inReview ?? 0} total={metrics.taskMetrics.total ?? 0} color="var(--color-neon-purple)" />
                      <StatusBar label="Done" value={metrics.taskMetrics.byStatusMap?.done ?? 0} total={metrics.taskMetrics.total ?? 0} color="var(--color-neon-green)" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="chart-card">
                  <CardHeader>
                    <CardTitle>Tasks by Priority</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="priority-chart">
                      <PriorityItem label="Critical" value={8} color="var(--color-neon-red)" />
                      <PriorityItem label="High" value={24} color="var(--color-neon-orange)" />
                      <PriorityItem label="Medium" value={45} color="var(--color-neon-yellow)" />
                      <PriorityItem label="Low" value={23} color="var(--color-neon-green)" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="chart-card">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="activity-list">
                      <ActivityItem
                        type="completed"
                        message="Task 'Implement login' completed"
                        time="2 hours ago"
                      />
                      <ActivityItem
                        type="created"
                        message="New task 'Design dashboard' created"
                        time="4 hours ago"
                      />
                      <ActivityItem
                        type="assigned"
                        message="Task assigned to John Doe"
                        time="5 hours ago"
                      />
                      <ActivityItem
                        type="comment"
                        message="New comment on 'API integration'"
                        time="6 hours ago"
                      />
                      <ActivityItem
                        type="updated"
                        message="Task priority changed to High"
                        time="8 hours ago"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabPanel>

            <TabPanel id="productivity">
              <div className="productivity-content">
                <Card>
                  <CardHeader>
                    <CardTitle>Productivity Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="trend-chart-placeholder">
                      <svg width="100%" height="200" viewBox="0 0 800 200">
                        <polyline
                          fill="none"
                          stroke="var(--color-neon-purple)"
                          strokeWidth="2"
                          points="0,150 100,120 200,140 300,80 400,90 500,60 600,70 700,40 800,50"
                        />
                        <polyline
                          fill="none"
                          stroke="var(--color-neon-green)"
                          strokeWidth="2"
                          strokeDasharray="4"
                          points="0,160 100,150 200,130 300,120 400,100 500,90 600,80 700,70 800,60"
                        />
                      </svg>
                      <div className="chart-legend">
                        <span><span className="legend-dot" style={{ background: 'var(--color-neon-purple)' }} /> Tasks Created</span>
                        <span><span className="legend-dot" style={{ background: 'var(--color-neon-green)' }} /> Tasks Completed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabPanel>

            <TabPanel id="team">
              <div className="team-content">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="team-stats">
                      {[
                        { name: 'John Doe', completed: 24, assigned: 28 },
                        { name: 'Jane Smith', completed: 31, assigned: 35 },
                        { name: 'Bob Johnson', completed: 18, assigned: 22 },
                        { name: 'Alice Brown', completed: 27, assigned: 30 },
                      ].map((member) => (
                        <div key={member.name} className="team-member-stat">
                          <div className="member-info">
                            <span className="member-name">{member.name}</span>
                            <span className="member-tasks">{member.completed}/{member.assigned} tasks</span>
                          </div>
                          <ProgressBar
                            value={member.completed}
                            max={member.assigned}
                            size="sm"
                            variant={member.completed / member.assigned > 0.8 ? 'success' : 'default'}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
}

function MetricCard({ title, value, change, variant = 'default', icon }: MetricCardProps) {
  const variantColors = {
    default: 'var(--color-neon-purple)',
    success: 'var(--color-neon-green)',
    warning: 'var(--color-neon-orange)',
    danger: 'var(--color-neon-red)',
  };

  return (
    <Card className={`metric-card metric-${variant}`}>
      <CardContent>
        <div className="metric-header">
          <span className="metric-icon" style={{ color: variantColors[variant] }}>
            {icon}
          </span>
          {change !== undefined && (
            <Badge
              variant={change >= 0 ? 'success' : 'danger'}
              size="sm"
            >
              {change >= 0 ? '+' : ''}{change}%
            </Badge>
          )}
        </div>
        <div className="metric-value">{formatNumber(value)}</div>
        <div className="metric-title">{title}</div>
      </CardContent>
    </Card>
  );
}

interface StatusBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

function StatusBar({ label, value, total, color }: StatusBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="status-bar-item">
      <div className="status-bar-header">
        <span className="status-bar-label">{label}</span>
        <span className="status-bar-value">{value}</span>
      </div>
      <div className="status-bar-track">
        <div
          className="status-bar-fill"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

interface PriorityItemProps {
  label: string;
  value: number;
  color: string;
}

function PriorityItem({ label, value, color }: PriorityItemProps) {
  return (
    <div className="priority-item">
      <span className="priority-dot" style={{ backgroundColor: color }} />
      <span className="priority-label">{label}</span>
      <span className="priority-value">{value}</span>
    </div>
  );
}

interface ActivityItemProps {
  type: 'completed' | 'created' | 'assigned' | 'comment' | 'updated';
  message: string;
  time: string;
}

function ActivityItem({ type, message, time }: ActivityItemProps) {
  const icons = {
    completed: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-green)" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    created: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-blue)" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    assigned: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-purple)" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    comment: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-orange)" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    updated: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-yellow)" strokeWidth="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  };

  return (
    <div className="activity-item">
      <span className="activity-icon">{icons[type]}</span>
      <div className="activity-content">
        <span className="activity-message">{message}</span>
        <span className="activity-time">{time}</span>
      </div>
    </div>
  );
}

