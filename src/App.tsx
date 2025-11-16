import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const cloneTodos = (list: Todo[]) => list.map((todo) => ({ ...todo }));

let serverTodos = cloneTodos(seedTodos);

const fakeFetchTodos = () =>
  new Promise<Todo[]>((resolve) => {
    setTimeout(() => resolve(cloneTodos(serverTodos)), 400);
  });

const fakePersistTodos = (nextTodos: Todo[]) =>
  new Promise<Todo[]>((resolve) => {
    setTimeout(() => {
      serverTodos = cloneTodos(nextTodos);
      resolve(cloneTodos(serverTodos));
    }, 250);
  });

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const creationCount = useRef(0);
  const isMounted = useRef(true);
  const intervalRef = useRef<number | undefined>(undefined);
  const latestTodosRef = useRef<Todo[]>([]);

  useEffect(() => {
    latestTodosRef.current = todos;
  }, [todos]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refreshTodos = useCallback(() => {
    fakeFetchTodos()
      .then((data) => {
        if (isMounted.current) {
          setTodos(data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch todos", error);
      });
  }, []);

  useEffect(() => {
    refreshTodos();
  }, [refreshTodos]);

  useEffect(() => {
    if (!autoRefresh) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      return;
    }

    refreshTodos();

    intervalRef.current = window.setInterval(() => {
      refreshTodos();
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [autoRefresh, refreshTodos]);

  const visibleTodos = useMemo(() => {
    if (filter === "done") {
      return todos.filter((todo) => todo.completed);
    }

    if (filter === "open") {
      return todos.filter((todo) => !todo.completed);
    }

    return todos;
  }, [filter, todos]);

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos]
  );

  const averageTitleLength = useMemo(() => {
    if (todos.length === 0) {
      return 0;
    }

    return (
      todos.reduce((sum, todo) => sum + todo.title.length, 0) / todos.length
    );
  }, [todos]);

  const handleAddTodo = async () => {
    const title = newTitle.trim();
    if (!title) {
      return;
    }

    creationCount.current += 1;

    const nextTodos = [
      ...latestTodosRef.current,
      {
        id: Date.now(),
        title,
        completed: false,
      },
    ];

    try {
      const persisted = await fakePersistTodos(nextTodos);
      if (isMounted.current) {
        setTodos(persisted);
        setNewTitle("");
      }
    } catch (error) {
      console.error("Failed to add todo", error);
    }
  };

  const handleToggle = async (id: number) => {
    const nextTodos = latestTodosRef.current.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );

    try {
      const persisted = await fakePersistTodos(nextTodos);
      if (isMounted.current) {
        setTodos(persisted);
      }
    } catch (error) {
      console.error("Failed to toggle todo", error);
    }
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
          onChange={(event) => setNewTitle(event.target.value)}
        />
        <button onClick={handleAddTodo}>Add</button>
      </section>

      <section>
        <label>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={() => setAutoRefresh((previous) => !previous)}
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
