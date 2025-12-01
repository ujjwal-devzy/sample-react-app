/**
 * Main Application Component
 * Enterprise-grade task management application
 */

import { useState, Suspense, lazy } from 'react';
import { TaskBoard, TaskProvider } from './features/tasks';
import { AuthProvider, useAuth } from './features/auth';
import { ProjectProvider } from './features/projects';
import { ToastProvider } from './shared/components/Toast';
import { GlobalSearch, SearchTrigger } from './features/search';
import { Spinner } from './shared/components/Loading';
import { Avatar } from './shared/components/Avatar';
import { CountBadge } from './shared/components/Badge';
import { Dropdown, DropdownItem, DropdownDivider, DropdownLabel } from './shared/components/Dropdown';
import { Button } from './shared/components/Button';

// Lazy load heavy components
const ProjectDashboard = lazy(() => import('./features/projects/components/ProjectDashboard').then(m => ({ default: m.ProjectDashboard })));
const TeamList = lazy(() => import('./features/teams/components/TeamList').then(m => ({ default: m.TeamList })));
const AnalyticsDashboard = lazy(() => import('./features/analytics/components/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));

// ============================================
// NAVIGATION
// ============================================

type AppView = 'tasks' | 'projects' | 'teams' | 'analytics' | 'settings';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick: () => void;
}

function NavItem({ icon, label, active, badge, onClick }: NavItemProps) {
  return (
    <button
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
      title={label}
    >
      <span className="nav-item-icon">{icon}</span>
      <span className="nav-item-label">{label}</span>
      {badge !== undefined && badge > 0 && (
        <CountBadge count={badge} max={99} variant="danger" />
      )}
    </button>
  );
}

// ============================================
// SIDEBAR
// ============================================

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function Sidebar({ currentView, onViewChange, collapsed, onToggleCollapse }: SidebarProps) {
  const navItems: Array<{ view: AppView; icon: React.ReactNode; label: string; badge?: number }> = [
    {
      view: 'tasks',
      label: 'Tasks',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      ),
      badge: 3,
    },
    {
      view: 'projects',
      label: 'Projects',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </svg>
      ),
    },
    {
      view: 'teams',
      label: 'Teams',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
    {
      view: 'analytics',
      label: 'Analytics',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      view: 'settings',
      label: 'Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
            <path d="M10 16l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          {!collapsed && <span className="sidebar-title">TaskFlow</span>}
        </div>
        <button className="sidebar-toggle" onClick={onToggleCollapse}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {collapsed ? (
              <path d="M9 18l6-6-6-6" />
            ) : (
              <path d="M15 18l-6-6 6-6" />
            )}
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavItem
            key={item.view}
            icon={item.icon}
            label={item.label}
            active={currentView === item.view}
            badge={item.badge}
            onClick={() => onViewChange(item.view)}
          />
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-help">
          <button className="sidebar-help-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {!collapsed && <span>Help & Support</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

// ============================================
// HEADER
// ============================================

interface HeaderProps {
  onOpenSearch: () => void;
}

function Header({ onOpenSearch }: HeaderProps) {
  const { state: { user }, logout } = useAuth();
  const [notificationCount] = useState(5);

  return (
    <header className="app-header">
      <div className="header-left">
        <SearchTrigger onClick={onOpenSearch} />
      </div>

      <div className="header-right">
        {/* Notifications */}
        <Dropdown
          trigger={
            <button className="header-icon-btn" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {notificationCount > 0 && (
                <span className="header-icon-badge">{notificationCount}</span>
              )}
            </button>
          }
          placement="bottom-end"
        >
          <DropdownLabel>Notifications</DropdownLabel>
          <DropdownItem>
            <span className="notification-item">
              <strong>Task assigned:</strong> Design login page
            </span>
          </DropdownItem>
          <DropdownItem>
            <span className="notification-item">
              <strong>Comment:</strong> John mentioned you
            </span>
          </DropdownItem>
          <DropdownItem>
            <span className="notification-item">
              <strong>Project update:</strong> Sprint 3 started
            </span>
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem>View all notifications</DropdownItem>
        </Dropdown>

        {/* User Menu */}
        <Dropdown
          trigger={
            <button className="header-user-btn">
              <Avatar
                name={user?.displayName || 'User'}
                src={user?.avatarUrl}
                size="sm"
              />
              <span className="header-user-name">{user?.displayName || 'User'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          }
          placement="bottom-end"
        >
          <div className="dropdown-user-info">
            <Avatar name={user?.displayName || 'User'} src={user?.avatarUrl} size="lg" />
            <div>
              <p className="dropdown-user-name">{user?.displayName || 'User'}</p>
              <p className="dropdown-user-email">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <DropdownDivider />
          <DropdownItem icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }>
            Profile
          </DropdownItem>
          <DropdownItem icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4" />
            </svg>
          }>
            Settings
          </DropdownItem>
          <DropdownItem icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }>
            Help Center
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem
            danger
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            }
            onClick={logout}
          >
            Sign out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}

// ============================================
// MAIN CONTENT
// ============================================

interface MainContentProps {
  currentView: AppView;
}

function MainContent({ currentView }: MainContentProps) {
  const renderContent = () => {
    switch (currentView) {
      case 'tasks':
  return (
    <TaskProvider>
      <TaskBoard />
    </TaskProvider>
        );
      case 'projects':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ProjectDashboard projectId="proj_001" />
          </Suspense>
        );
      case 'teams':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <div className="page-container">
              <div className="page-header">
                <h1 className="page-title">Teams</h1>
                <p className="page-subtitle">Manage your teams and collaborate with members</p>
              </div>
              <TeamList />
            </div>
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AnalyticsDashboard />
          </Suspense>
        );
      case 'settings':
        return (
          <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">Settings</h1>
              <p className="page-subtitle">Configure your account and preferences</p>
            </div>
            <SettingsPage />
          </div>
        );
      default:
        return null;
    }
  };

  return <main className="main-content">{renderContent()}</main>;
}

// ============================================
// LOADING FALLBACK
// ============================================

function LoadingFallback() {
  return (
    <div className="loading-fallback">
      <Spinner size="lg" />
      <p>Loading...</p>
    </div>
  );
}

// ============================================
// SETTINGS PAGE
// ============================================

function SettingsPage() {
  return (
    <div className="settings-page">
      <div className="settings-section">
        <h2 className="settings-section-title">Profile</h2>
        <div className="settings-card">
          <div className="settings-field">
            <label>Display Name</label>
            <input type="text" defaultValue="John Doe" className="input" />
          </div>
          <div className="settings-field">
            <label>Email</label>
            <input type="email" defaultValue="john@example.com" className="input" />
          </div>
          <Button>Save Changes</Button>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Appearance</h2>
        <div className="settings-card">
          <div className="settings-field">
            <label>Theme</label>
            <select className="input">
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="settings-field">
            <label>
              <input type="checkbox" defaultChecked />
              <span>Reduce motion</span>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Notifications</h2>
        <div className="settings-card">
          <div className="settings-field">
            <label>
              <input type="checkbox" defaultChecked />
              <span>Email notifications</span>
            </label>
          </div>
          <div className="settings-field">
            <label>
              <input type="checkbox" defaultChecked />
              <span>Push notifications</span>
            </label>
          </div>
          <div className="settings-field">
            <label>
              <input type="checkbox" />
              <span>Desktop notifications</span>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section settings-danger">
        <h2 className="settings-section-title">Danger Zone</h2>
        <div className="settings-card">
          <p>Once you delete your account, there is no going back. Please be certain.</p>
          <Button variant="danger">Delete Account</Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// APP LAYOUT
// ============================================

function AppLayout() {
  const [currentView, setCurrentView] = useState<AppView>('tasks');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="app-main">
        <Header onOpenSearch={() => setSearchOpen(true)} />
        <MainContent currentView={currentView} />
      </div>
      <GlobalSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(url) => {
          console.log('Navigate to:', url);
          setSearchOpen(false);
        }}
      />
    </div>
  );
}

// ============================================
// APP WITH PROVIDERS
// ============================================

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProjectProvider>
          <AppLayout />
        </ProjectProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
