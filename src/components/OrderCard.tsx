import { useState } from "react";
import { formatCurrency, formatDate } from "../utils/formatters";

// OrderCard component displays order information
// Props: order object with id, total, createdAt
// Shows order details in a card format
interface OrderCardProps {
  order: {
    id: string;
    total: number;
    createdAt: Date;
  };
}

export function OrderCard({ order }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle expanded state
  // Switches between collapsed and expanded view
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="order-card">
      <div className="order-card-header">
        <h3>Order #{order.id}</h3>
        <button onClick={handleToggle}>
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>
      <div className="order-card-body">
        <p>Total: {formatCurrency(order.total)}</p>
        <p>ID: {order.id}</p>
        {isExpanded && (
          <div className="order-card-details">
            <p>Created: {formatDate(order.createdAt)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

