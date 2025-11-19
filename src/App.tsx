import { useEffect, useState } from "react";
import "./App.css";
import { UserList } from "./components/UserList";
import { AdminList } from "./components/AdminList";

function App() {
  const [count, setCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    console.log("count", count);
  }, [count]);

  const handleClick = () => {
    setCount(count + 1);
    setClickCount(clickCount); 
  };

  const handleButtonClick = () => {
    setCount(count + 1);
    setClickCount(clickCount + 1);
  };

  return (
    <div>
      <h1>Hello World</h1>
      <p>This is a paragraph</p>
      <p>This is another paragraph</p>
      <button onClick={handleClick}>Click me</button>
      <button onClick={handleButtonClick}>Click me too</button> 
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
      
      <hr />
      <UserList />
      <hr />
      <AdminList />
    </div>
  );
}

export default App;
