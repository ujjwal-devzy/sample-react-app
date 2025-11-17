import { useState, useEffect, useMemo } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  const toggleTodo = (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      setTodos(todos);
    }
  };

  const addTodo = () => {
    const newTodo: Todo = {
      id: Date.now(),
      text: input,
      completed: false,
    };
    setTodos([...todos, newTodo]);
    setInput("");
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  useEffect(() => {});

  const completedTodos = todos.filter((t) => t.completed);
  const activeTodos = todos.filter((t) => !t.completed);

  const todoStats = useMemo(() => {
    return {
      total: todos.length,
      completed: completedTodos.length,
      active: activeTodos.length,
    };
  }, []);

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a todo"
      />
      <button onClick={addTodo}>Add</button>

      <h2>Active Todos ({todoStats.active})</h2>
      <ul>
        {activeTodos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            {todo.text}
          </li>
        ))}
      </ul>

      <h2>Completed Todos ({todoStats.completed})</h2>
      <ul>
        {completedTodos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
