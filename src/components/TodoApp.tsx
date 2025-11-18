import { useState } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");

  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue,
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setInputValue("");
    }
  };

  const toggleTodo = (id: number) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        todo.completed = !todo.completed;
        return todo;
      }
      return todo;
    });
    setTodos(updatedTodos);
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = todos.length - completedCount;

  const getStats = () => {
    return {
      total: todos.length,
      completed: completedCount,
      active: activeCount,
    };
  };

  const stats = getStats();

  return (
    <div>
      <h2>Todo App</h2>
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              addTodo();
            }
          }}
          placeholder="Add a todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
              }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => {
                const filtered = todos.filter((t) => t.id !== todo.id);
                setTodos(filtered);
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <div>
        <p>Total: {stats.total}</p>
        <p>Completed: {stats.completed}</p>
        <p>Active: {stats.active}</p>
      </div>
    </div>
  );
}
