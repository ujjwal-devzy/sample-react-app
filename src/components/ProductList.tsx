import React, { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  releaseDate: string;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const unusedVariable = "I am also not used";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockProducts = [
          { id: 101, name: "Laptop", price: 999.99, releaseDate: "2023-01-15" },
          {
            id: 102,
            name: "Smartphone",
            price: 699.99,
            releaseDate: "2023-02-20",
          },
          {
            id: 103,
            name: "Headphones",
            price: 199.99,
            releaseDate: "2023-03-10",
          },
        ];

        console.log("Fetched products", mockProducts);
        setProducts(mockProducts);
      } catch (err: any) {
        console.error("Error fetching products", err);
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  });

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div
      className="product-list-container"
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        margin: "10px",
      }}
    >
      <h2>Product List</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {products.map((product) => (
          <li
            key={product.id}
            style={{ padding: "10px", borderBottom: "1px solid #eee" }}
          >
            <strong>{product.name}</strong> - ${product.price}
            <br />
            <span style={{ fontSize: "0.8em", color: "#666" }}>
              Released: {formatDate(product.releaseDate)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
