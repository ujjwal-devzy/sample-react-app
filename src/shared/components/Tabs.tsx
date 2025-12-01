/**
 * Tabs Component
 * Tabbed navigation component
 */

import { useState, createContext, useContext, type ReactNode } from 'react';

// ============================================
// CONTEXT
// ============================================

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
  variant: 'default' | 'pills' | 'underline';
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within a Tabs component');
  }
  return context;
}

// ============================================
// TABS ROOT
// ============================================

interface TabsProps {
  children: ReactNode;
  defaultTab?: string;
  value?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export function Tabs({
  children,
  defaultTab,
  value,
  onChange,
  variant = 'default',
  className = '',
}: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultTab || '');

  const activeTab = value ?? internalTab;
  const setActiveTab = (id: string) => {
    if (onChange) {
      onChange(id);
    } else {
      setInternalTab(id);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant }}>
      <div className={`tabs tabs-${variant} ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

// ============================================
// TAB LIST
// ============================================

interface TabListProps {
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
}

export function TabList({ children, className = '', 'aria-label': ariaLabel }: TabListProps) {
  return (
    <div className={`tab-list ${className}`} role="tablist" aria-label={ariaLabel}>
      {children}
    </div>
  );
}

// ============================================
// TAB
// ============================================

interface TabProps {
  children: ReactNode;
  id: string;
  disabled?: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export function Tab({
  children,
  id,
  disabled = false,
  icon,
  badge,
  className = '',
}: TabProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === id;

  return (
    <button
      type="button"
      role="tab"
      id={`tab-${id}`}
      aria-selected={isActive}
      aria-controls={`tabpanel-${id}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      className={`tab ${isActive ? 'tab-active' : ''} ${className}`}
      onClick={() => setActiveTab(id)}
    >
      {icon && <span className="tab-icon">{icon}</span>}
      <span className="tab-label">{children}</span>
      {badge && <span className="tab-badge">{badge}</span>}
    </button>
  );
}

// ============================================
// TAB PANELS
// ============================================

interface TabPanelsProps {
  children: ReactNode;
  className?: string;
}

export function TabPanels({ children, className = '' }: TabPanelsProps) {
  return <div className={`tab-panels ${className}`}>{children}</div>;
}

// ============================================
// TAB PANEL
// ============================================

interface TabPanelProps {
  children: ReactNode;
  id: string;
  className?: string;
}

export function TabPanel({ children, id, className = '' }: TabPanelProps) {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === id;

  if (!isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className={`tab-panel ${className}`}
    >
      {children}
    </div>
  );
}

