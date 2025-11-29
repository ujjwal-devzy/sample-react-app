import { useState, useCallback } from 'react';
import { notificationService, Notification } from '../../backend/services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setNotifications([...notifications]);
      setLoading(false);
    }, 100);
  }, [notifications]);

  const markRead = (id: string) => {
    notificationService.markAsRead(id);
    refresh();
  };

  const getCount = () => notificationService.getUnreadCount();

  return { notifications, loading, refresh, markRead, getCount };
}

