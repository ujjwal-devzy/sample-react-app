import "./App.css";
import UserList from "./UserList";
import Calculator from "./Calculator";
import { useState, useEffect } from "react";

function App() {
  const [data, setData] = useState(null);
  const [items, setItems] = useState([1, 2, 3, 4, 5]);

  useEffect(() => {
    console.log("Component mounted");
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch("https://api.example.com/data");
      if (!response.ok) throw new Error('Network response was not ok');
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const displayData = () => {
    return data ? data.toString() : "No data available";
  };

  const addItem = () => {
    setItems([...items, 6]);
  };

  const renderItems = () => {
    return items.map((item, index) => <li key={index}>{item}</li>);
  };

  return (
    <div>
      <h1>Hello World</h1>
      <p>This is a paragraph</p>

      <button onClick={() => alert("Button clicked")}>Click me</button>
      <button onClick={loadData}>Load Data</button>
      <button onClick={addItem}>Add Item</button>

      <p>Data: {displayData()}</p>

      <ul>{renderItems()}</ul>

      <input type="text" placeholder="Enter your name" />
      <select>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </select>
      <textarea placeholder="Enter your message" />
      <label>
        <input type="checkbox" />
        <span>I agree to the terms and conditions</span>
      </label>

      <Calculator />
      <UserList />
    </div>
  );
}

export default App;
