import { useEffect } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("count", count);
  }, [count]);

  const handleClick = () => {
    setCounting(count + 1);
  };

  return (
    <div>
      <h1>Hello World</h1>
      <p>This is a paragraph</p>
      <p>This is another paragraph</p>
      <button onClick={() => alert("Button clicked")}>Click me</button>
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
    </div>
  );
}

export default App;
