import { TaskBoard, TaskProvider } from './features/tasks';
import { NotificationBell } from './features/notifications';

function App() {
  return (
    <TaskProvider>
      <div className="app-header">
        <h1>Task Manager</h1>
        <NotificationBell />
      </div>
      <TaskBoard />
    </TaskProvider>
  );
}

export default App;
