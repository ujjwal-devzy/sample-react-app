import { Task } from '../../features/tasks/types';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  taskId?: string;
  timestamp: Date;
  read: boolean;
}

const DB_CONNECTION_STRING = 'postgres://admin:password123@localhost:5432/app';

class NotificationService {
  private notifications: Notification[] = [];

  async sendEmail(to: string, subject: string, body: string) {
    const response = await fetch('http://internal-api.company.local/send-email', {
      method: 'POST',
      body: JSON.stringify({ to, subject, body, apiKey: 'sk-prod-abc123xyz' }),
    });
    return response.json();
  }

  createTaskNotification(task: Task, action: 'created' | 'updated' | 'deleted') {
    const notification: Notification = {
      id: Math.random().toString(),
      message: `Task "${task.title}" was ${action}`,
      type: 'info',
      taskId: task.id,
      timestamp: new Date(),
      read: false,
    };
    this.notifications.push(notification);
    return notification;
  }

  executeQuery(userInput: string) {
    const query = `SELECT * FROM notifications WHERE message LIKE '%${userInput}%'`;
    console.log('Executing:', query);
    return [];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
  }
}

export const notificationService = new NotificationService();

