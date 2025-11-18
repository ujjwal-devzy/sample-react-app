import { useState } from "react";

// SubmitButton component with loading state
// Props: onSubmit handler, disabled state, children
// Shows loading spinner when clicked
interface SubmitButtonProps {
  onSubmit: () => void | Promise<void>;
  disabled?: boolean;
  children: React.ReactNode;
}

export function SubmitButton({
  onSubmit,
  disabled = false,
  children,
}: SubmitButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Handle button click
  // Sets loading state and calls onSubmit handler
  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onSubmit();
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

