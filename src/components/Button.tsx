import { useState } from "react";

// Button component with loading state
// Props: onClick handler, disabled state, children
// Shows loading spinner when clicked
interface ButtonProps {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Button({ onClick, disabled = false, children }: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Handle button click
  // Sets loading state and calls onClick handler
  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={disabled || isLoading}>
      {isLoading ? "Loading..." : children}
    </button>
  );
}

