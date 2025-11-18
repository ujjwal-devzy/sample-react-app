import { useState } from "react";

interface ProductCardProps {
  name: string;
  price: number;
  category: string;
}

export function ProductCard({ name, price, category }: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  const formatName = (name: string): string => {
    return name
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div
      onClick={handleClick}
      style={{ cursor: "pointer", padding: "10px", border: "1px solid #ccc" }}
    >
      <h3>{formatName(name)}</h3>
      <p>Price: ${price.toFixed(2)}</p>
      {isExpanded && <p>Category: {category}</p>}
    </div>
  );
}
