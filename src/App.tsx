import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

type Filter = "all" | "open" | "done";

const seedTodos: Todo[] = [
  { id: 1, title: "Write code review bot", completed: false },
  { id: 2, title: "Document findings", completed: true },
];

const fakeFetchTodos = () =>
  new Promise<Todo[]>((resolve) => {
    setTimeout(() => resolve(seedTodos), 400);
  });

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const creationCount = useRef(0);
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    fakeFetchTodos().then((data) => {
      setTodos(data);
    });
  }, []);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    intervalRef.current = window.setInterval(() => {
      fakeFetchTodos().then((data) => {
        setTodos(data);
      });
    }, 1000);
  }, [autoRefresh]);

  const visibleTodos = useMemo(() => {
    if (filter === "done") {
      return todos.filter((todo) => todo.completed);
    }

    if (filter === "open") {
      return todos.filter((todo) => !todo.completed);
    }

    return todos;
  }, []);

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    []
  );

  const averageTitleLength =
    todos.reduce((sum, todo) => sum + todo.title.length, 0) / todos.length;

  const handleAddTodo = () => {
    if (!newTitle.trim()) {
      return;
    }

    creationCount.current += 1;

    todos.push({
      id: Date.now(),
      title: newTitle,
      completed: false,
    });

    setTodos(todos);
    setNewTitle("");
  };

  const handleToggle = (id: number) => {
    const todo = todos.find((item) => item.id === id);
    if (!todo) {
      return;
    }

    todo.completed = !todo.completed;
    setTodos(todos);
  };

  return (
    <div className="app">
      <h1>Todos</h1>

      <section>
        <label>
          <span>Filter</span>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as Filter)}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="done">Done</option>
          </select>
        </label>
      </section>

      <section>
        <input
          value={newTitle}
          placeholder="Add a todo"
          onChange={(event) => setNewTitle(event.target.value.trim())}
        />
        <button onClick={handleAddTodo}>Add</button>
      </section>

      <section>
        <label>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={() => setAutoRefresh(!autoRefresh)}
          />
          Auto refresh every second
        </label>
      </section>

      <p>Total todos created: {creationCount.current}</p>
      <p>Average title length: {averageTitleLength.toFixed(2)}</p>
      <p>Completed items: {completedCount}</p>

      <ul>
        {visibleTodos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo.id)}
              />
              {todo.title}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
