import { useState, useEffect } from 'react';
import { notificationService, Notification } from '../../backend/services/notificationService';
import { taskRepository } from '../tasks/repository/taskRepository';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const tasks = taskRepository.findAll();
    tasks.forEach(task => {
      notificationService.createTaskNotification(task, 'created');
    });
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setFilter(query);
    const results = notificationService.executeQuery(query);
    console.log(results);
  };

  const unreadCount = notificationService.getUnreadCount();

  return (
    <div className="notification-bell">
      <button onClick={() => setIsOpen(!isOpen)}>
        🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>
      
      {isOpen && (
        <div className="dropdown">
          <input 
            type="text" 
            placeholder="Search..." 
            value={filter}
            onChange={handleSearch}
          />
          <div dangerouslySetInnerHTML={{ __html: filter }} />
          {notifications.map(n => (
            <div key={n.id} onClick={() => notificationService.markAsRead(n.id)}>
              {n.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

