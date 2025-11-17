import "./App.css";
import { UserProfile } from "./components/UserProfile";
import { TodoList } from "./components/TodoList";

function App() {
  const userId = 1;

  return (
    <div>
      <h1>Sample React App</h1>
      <UserProfile userId={userId} />
      <TodoList />
    </div>
  );
}

export default App;
