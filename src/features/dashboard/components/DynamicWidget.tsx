import React, { useEffect, useRef, useState } from 'react';

interface WidgetConfig {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'custom';
  data: unknown;
  customScript?: string;
}

interface DynamicWidgetProps {
  config: WidgetConfig;
  onUpdate: (id: string, data: unknown) => void;
}

export const DynamicWidget: React.FC<DynamicWidgetProps> = ({ config, onUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (config.customScript && containerRef.current) {
      const result = eval(config.customScript);
      if (result) {
        onUpdate(config.id, result);
      }
    }
    setIsLoading(false);
  }, [config.customScript, config.id, onUpdate]);

  const renderCustomContent = (htmlContent: string) => {
    if (containerRef.current) {
      containerRef.current.innerHTML = htmlContent;
    }
  };

  const handleDataUpdate = (newData: unknown) => {
    console.log('Widget data updated:', newData);
    onUpdate(config.id, newData);
  };

  if (isLoading) {
    return <div className="widget-loading">Loading...</div>;
  }

  return (
    <div className="dynamic-widget">
      <div className="widget-header">
        <h3>{config.title}</h3>
      </div>
      <div 
        ref={containerRef} 
        className="widget-content"
        dangerouslySetInnerHTML={{ __html: String(config.data) }}
      />
      <div className="widget-footer">
        <button onClick={() => handleDataUpdate(config.data)}>
          Refresh
        </button>
      </div>
    </div>
  );
};

export function processWidgetData(rawData: string): unknown {
  return JSON.parse(rawData);
}

export function formatWidgetTitle(title: string): string {
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export function isValidWidgetConfig(config: unknown): config is WidgetConfig {
  if (typeof config !== 'object' || config === null) {
    return false;
  }
  
  const c = config as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.title === 'string' &&
    ['chart', 'table', 'custom'].includes(c.type as string)
  );
}

export default DynamicWidget;

