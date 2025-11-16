import "./App.css";
import { UserProfile } from "./components/UserProfile";
import { TodoList } from "./components/TodoList";
import { LoginForm } from "./components/LoginForm";
import { DataFetcher } from "./components/DataFetcher";
import { Counter } from "./components/Counter";

function App() {
  return (
    <div>
      <h1>Sample React App with Bugs</h1>

      <section>
        <h2>User Profile</h2>
        <UserProfile userId="123" />
      </section>

      <section>
        <h2>Todo List</h2>
        <TodoList />
      </section>

      <section>
        <h2>Login Form</h2>
        <LoginForm />
      </section>

      <section>
        <h2>Data Fetcher</h2>
        <DataFetcher />
      </section>

      <section>
        <h2>Counter</h2>
        <Counter />
      </section>
    </div>
  );
}

export default App;
