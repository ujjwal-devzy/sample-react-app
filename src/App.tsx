import "./App.css";
import { UserList } from "./components/UserList";
import { UserForm } from "./components/UserForm";
import { TodoApp } from "./components/TodoApp";
import { ProductCard } from "./components/ProductCard";
import { SearchBar } from "./components/SearchBar";
import { calculateTotalPrice } from "./utils/calculations";

function App() {
  const sampleProduct = {
    id: 1,
    name: "Sample Product",
    price: 99.99,
    description: "This is a sample product"
  };

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

  const handleAddToCart = (productId: number) => {
    console.log("Adding product to cart:", productId);
  };

  const testItems = [
    { price: 10, quantity: 2 },
    { price: 20, quantity: 1, discount: 5 }
  ];
  const total = calculateTotalPrice(testItems);

  return (
    <div>
      <h1>Sample React App</h1>
      
      <section>
        <h2>User Management</h2>
        <UserForm />
        <UserList />
      </section>

      <section>
        <h2>Todos</h2>
        <TodoApp />
      </section>

      <section>
        <h2>Products</h2>
        <SearchBar onSearch={handleSearch} />
        <ProductCard 
          product={sampleProduct} 
          onAddToCart={handleAddToCart}
        />
        <p>Total Price: ${total}</p>
      </section>
    </div>
  );
}

export default App;
