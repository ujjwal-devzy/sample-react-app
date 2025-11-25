/**
 * App Component - Application Root
 * Demonstrates clean architecture with feature-based structure
 */

import { TaskBoard, TaskProvider } from './features/tasks';

function App() {
  return (
    <TaskProvider>
      <TaskBoard />
    </TaskProvider>
  );
}

export default App;
