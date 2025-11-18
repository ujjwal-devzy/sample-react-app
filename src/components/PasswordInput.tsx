import { useState } from "react";
import { validatePassword } from "../utils/validation";

// PasswordInput component for password form input
// Handles password validation and user input
// Shows error message if password is invalid
export function PasswordInput() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Handle input change
  // Updates password state and validates input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value && !validatePassword(value)) {
      setError("Password must be at least 8 characters long");
    } else {
      setError("");
    }
  };

  // Handle form submission
  // Validates password before submitting
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters long");
      return;
    }
    console.log("Password submitted");
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={handleChange}
          placeholder="Enter your password"
        />
      </label>
      {error && <span className="error">{error}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}

