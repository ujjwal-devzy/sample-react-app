/**
 * App Component - Application Root
 * Demonstrates clean architecture with feature-based structure
 */

import { useState, useEffect } from 'react';
import { TaskBoard, TaskProvider } from './features/tasks';
import { AnalyticsDashboard, useAnalytics } from './features/analytics';

const MOCK_USER_ID = 'user_12345';

function AppContent() {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { trackPageView, trackAction, identifyUser } = useAnalytics({
    enabled: true,
    userId: MOCK_USER_ID,
  });

  useEffect(() => {
    identifyUser(MOCK_USER_ID, {
      email: 'test@example.com',
      plan: 'pro',
    });
    trackPageView('app_home');
  }, []);

  const handleToggleAnalytics = () => {
    setShowAnalytics(!showAnalytics);
    trackAction('toggle_analytics', undefined, true);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6',
      padding: '20px',
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>📋 Task Manager</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleToggleAnalytics}
            style={{
              padding: '8px 16px',
              backgroundColor: showAnalytics ? '#3b82f6' : '#e5e7eb',
              color: showAnalytics ? '#ffffff' : '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            📊 {showAnalytics ? 'Hide' : 'Show'} Analytics
          </button>
        </div>
      </nav>

      {/* Conditional Analytics Dashboard */}
      {showAnalytics && (
        <div style={{ marginBottom: '24px' }}>
          <AnalyticsDashboard userId={MOCK_USER_ID} refreshInterval={60000} />
        </div>
      )}

      {/* Main Task Board */}
      <TaskBoard />
    </div>
  );
}

function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}

export default App;
