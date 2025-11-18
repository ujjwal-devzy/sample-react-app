import "./App.css";
import { UserCard } from "./components/UserCard";
import { ProductCard } from "./components/ProductCard";
import { validateEmail } from "./utils/validation";
import { isValidEmail } from "./utils/helpers";
import { useApi } from "./hooks/useApi";
import { useFetch } from "./hooks/useFetch";

function App() {
  const userData = useApi('/api/user');
  const productData = useFetch('/api/product');
  
  const handleEmailCheck = (email: string) => {
    const result1 = validateEmail(email);
    const result2 = isValidEmail(email);
    return result1 && result2;
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
      <UserCard name="John Doe" email="john@example.com" age={30} />
      <ProductCard name="Laptop" price={999.99} category="Electronics" />
    </div>
  );
}

export default App;
