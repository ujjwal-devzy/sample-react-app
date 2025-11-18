import { useState } from "react";

interface UserCardProps {
  name: string;
  email: string;
  age: number;
}

export function UserCard({ name, email, age }: UserCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  const isValidEmail = (email: string): boolean => {
    if (!email || typeof email !== "string") {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
      <p>{isValidEmail(email) ? email : "Invalid email"}</p>
      {isExpanded && <p>Age: {age}</p>}
    </div>
  );
}
