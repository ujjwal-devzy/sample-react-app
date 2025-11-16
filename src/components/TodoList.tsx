import { useState } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");

  const addTodo = () => {
    const newTodo = {
      id: todos.length + 1,
      text: inputValue,
      completed: false,
    };
    todos.push(newTodo);
    setTodos(todos);
  };

  const toggleTodo = (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      setTodos(todos);
    }
  };

  const filterCompleted = () => {
    return todos.filter((todo) => todo.completed);
  };

  return (
    <div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button onClick={addTodo}>Add Todo</button>

      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            {todo.text}
          </li>
        ))}
      </ul>

      <p>Completed: {filterCompleted().length}</p>
    </div>
  );
}
