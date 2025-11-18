import "./App.css";
import { UserCard } from "./components/UserCard";
import { ProductCard } from "./components/ProductCard";
import { OrderCard } from "./components/OrderCard";
import { EmailInput } from "./components/EmailInput";
import { PhoneInput } from "./components/PhoneInput";
import { PasswordInput } from "./components/PasswordInput";

function App() {
  // Sample data for demonstration
  const sampleUser = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    createdAt: new Date("2024-01-15"),
  };

  const sampleProduct = {
    id: "101",
    name: "Sample Product",
    price: 99.99,
    createdAt: new Date("2024-01-10"),
  };

  const sampleOrder = {
    id: "1001",
    total: 199.98,
    createdAt: new Date("2024-01-20"),
  };

  return (
    <div className="app">
      <h1>Sample React App</h1>
      
      <section className="forms-section">
        <h2>Form Inputs</h2>
        <EmailInput />
        <PhoneInput />
        <PasswordInput />
      </section>

      <section className="cards-section">
        <h2>Data Cards</h2>
        <UserCard user={sampleUser} />
        <ProductCard product={sampleProduct} />
        <OrderCard order={sampleOrder} />
      </section>
    </div>
  );
}

export default App;
