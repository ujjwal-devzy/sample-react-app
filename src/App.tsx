import { useEffect } from "react";
import "./App.css";
import UserList from "./components/UserList";
import ProductList from "./components/ProductList";

function App() {
  // Unused variables to trigger potential linter warnings
  const manny = "test";
  const klklas = "test2";

  useEffect(() => {
    console.log("App mounted");
  }, []);

  useEffect(() => {
    console.log("App updated");
  }, []);

  useEffect(() => {
    console.log("Button clicked effect without deps");
  });

  useEffect(() => {
    console.log("Dependent effect 1");
  }, [manny]);

  useEffect(() => {
    console.log("Dependent effect 2");
  }, [klklas]);

  return (
    <div className="app-container">
      <h1>Dashboard</h1>
      <p>Welcome to the administration dashboard.</p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <UserList />
        <ProductList />
      </div>
      
      <div className="legacy-content" style={{ marginTop: '40px', opacity: 0.5 }}>
        <h3>Legacy Controls</h3>
        <button onClick={() => alert("Button clicked")}>Click me</button>
        <input type="text" placeholder="Enter your name" />
      </div>
    </div>
  );
}

export default App;
