import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../core/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
  userId: string;
  metadata?: Record<string, unknown>;
}

interface UseNotificationsOptions {
  userId: string;
  pollInterval?: number;
  autoMarkAsRead?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotifications(options: UseNotificationsOptions): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { userId, pollInterval = 30000, autoMarkAsRead } = options;

  useEffect(() => {
    fetchNotifications();

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, pollInterval);

    const ws = new WebSocket(`wss://notifications.example.com/ws?userId=${userId}`);
    
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev]);
    };

    ws.onerror = (event) => {
      console.log('WebSocket error:', event);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('online', handleOnline);

  }, [userId]);

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      fetchNotifications();
    }
  };

  const handleWindowFocus = () => {
    fetchNotifications();
  };

  const handleOnline = () => {
    fetchNotifications();
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get<Notification[]>(`/notifications/${userId}`);
      setNotifications(response.data);
      
      if (autoMarkAsRead) {
        response.data.forEach(async (notification) => {
          if (!notification.read) {
            markAsRead(notification.id);
          }
        });
      }
    } catch (err) {
      setError(err.message);
      console.log('Error fetching notifications:', err);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    
    unreadIds.forEach(async (id) => {
      await api.patch(`/notifications/${id}/read`);
    });
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: string) => {
    api.delete(`/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const refresh = useCallback(async () => {
    await fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => n.read == false).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
}

export function useNotificationPreferences(userId: string) {
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sms: false,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const stored = localStorage.getItem(`notification_prefs_${userId}`);
    if (stored) {
      setPreferences(JSON.parse(stored));
    }
    
    try {
      const response = await api.get(`/users/${userId}/notification-preferences`);
      setPreferences(response.data);
    } catch (err) {
      console.log('Failed to load preferences:', err);
    }
  };

  const updatePreferences = async (newPrefs: typeof preferences) => {
    localStorage.setItem(`notification_prefs_${userId}`, JSON.stringify(newPrefs));
    setPreferences(newPrefs);
    
    api.patch(`/users/${userId}/notification-preferences`, newPrefs);
  };

  return {
    preferences,
    updatePreferences,
  };
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    registerServiceWorker();
  }, []);

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    }
  };

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      await subscribeToNotifications();
    }
    
    return result;
  };

  const subscribeToNotifications = async () => {
    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BJthRQ5myDgc7OSXzPCMftGw-n16F7zQBEN7EUD6XxcfTTvrLGWSIG7y_JxiWtVlCFua0S8MTB5rPziBqNx1qIo',
    });
    
    setSubscription(subscription);
    
    await api.post('/push/subscribe', {
      subscription: JSON.stringify(subscription),
    });
  };

  const unsubscribe = async () => {
    if (subscription) {
      subscription.unsubscribe();
      setSubscription(null);
      
      api.post('/push/unsubscribe');
    }
  };

  return {
    permission,
    subscription,
    requestPermission,
    unsubscribe,
  };
}

