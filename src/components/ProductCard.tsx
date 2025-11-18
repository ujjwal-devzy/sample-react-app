import { useState } from "react";
import { formatCurrency, formatDate } from "../utils/formatters";

// ProductCard component displays product information
// Props: product object with id, name, price, createdAt
// Shows product details in a card format
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    createdAt: Date;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle expanded state
  // Switches between collapsed and expanded view
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="product-card">
      <div className="product-card-header">
        <h3>{product.name}</h3>
        <button onClick={handleToggle}>
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>
      <div className="product-card-body">
        <p>Price: {formatCurrency(product.price)}</p>
        <p>ID: {product.id}</p>
        {isExpanded && (
          <div className="product-card-details">
            <p>Created: {formatDate(product.createdAt)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

