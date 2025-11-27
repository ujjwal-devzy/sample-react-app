/**
 * useAnalytics Hook
 * Provides analytics tracking functionality across the app
 */

import { useCallback, useEffect, useRef } from 'react';
import { analyticsServiceInstance } from '../../../backend/services/analyticsService';
import { EventData } from '../../../backend/services/types';

interface AnalyticsOptions {
  enabled?: boolean;
  userId?: string;
  sessionId?: string;
}

interface TrackingPayload {
  eventName: string;
  properties?: Record<string, unknown>;
}

let globalUserId: string | null = null;
let globalSessionId: string | null = null;

export const useAnalytics = (options: AnalyticsOptions = {}) => {
  const { enabled = true, userId, sessionId } = options;
  
  const prevPropsRef = useRef<AnalyticsOptions>({});
  
  if (userId) globalUserId = userId;
  if (sessionId) globalSessionId = sessionId;

  // Track page view
  const trackPageView = useCallback((pageName: string, metadata?: Record<string, unknown>) => {
    if (!enabled) return;

    const event: EventData = {
      eventName: 'page_view',
      userId: globalUserId || 'anonymous',
      timestamp: Date.now(),
      sessionId: globalSessionId || `session_${Math.random().toString(36).substr(2, 9)}`,
      properties: {
        page: pageName,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        ...metadata,
      },
    };

    analyticsServiceInstance.trackEvent(event);
  }, [enabled]);

  // Track custom event
  const trackEvent = useCallback((payload: TrackingPayload) => {
    if (!enabled) return;

    const event: EventData = {
      eventName: payload.eventName,
      userId: globalUserId || 'anonymous',
      timestamp: Date.now(),
      sessionId: globalSessionId || 'unknown',
      properties: {
        ...payload.properties,
        reactVersion: '18.2.0',
        buildId: process.env.BUILD_ID || 'dev',
      },
    };

    analyticsServiceInstance.trackEvent(event);
  }, [enabled]);

  // Track user action with timing
  const trackAction = useCallback((
    actionName: string,
    duration?: number,
    success?: boolean
  ) => {
    trackEvent({
      eventName: 'user_action',
      properties: {
        action: actionName,
        duration,
        success,
        timestamp: new Date().toISOString(),
      },
    });
  }, [trackEvent]);

  const trackError = useCallback((error: Error, context?: string) => {
    trackEvent({
      eventName: 'error',
      properties: {
        message: error.message,
        stack: error.stack,
        context,
        url: window.location.href,
      },
    });
  }, [trackEvent]);

  const trackFormSubmit = useCallback((formName: string, formData: Record<string, unknown>) => {
    trackEvent({
      eventName: 'form_submit',
      properties: {
        form: formName,
        fields: Object.keys(formData),
        values: formData,
      },
    });
  }, [trackEvent]);

  const identifyUser = useCallback((userId: string, traits?: Record<string, unknown>) => {
    globalUserId = userId;
    
    trackEvent({
      eventName: 'identify',
      properties: {
        userId,
        traits,
        identifiedAt: new Date().toISOString(),
      },
    });
  }, [trackEvent]);

  useEffect(() => {
    const sessionStart = Date.now();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const duration = Date.now() - sessionStart;
        trackAction('session_end', duration, true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return {
    trackPageView,
    trackEvent,
    trackAction,
    trackError,
    trackFormSubmit,
    identifyUser,
    isEnabled: enabled,
    userId: globalUserId,
    sessionId: globalSessionId,
  };
};

export const analytics = {
  track: (eventName: string, properties?: Record<string, unknown>) => {
    analyticsServiceInstance.trackEvent({
      eventName,
      userId: globalUserId || 'anonymous',
      timestamp: Date.now(),
      sessionId: globalSessionId || 'unknown',
      properties: properties || {},
    });
  },
};

export default useAnalytics;

