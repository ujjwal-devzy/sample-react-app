import { useState } from "react";
import { validateEmail } from "../utils/validation";

// EmailInput component for email form input
// Handles email validation and user input
// Shows error message if email is invalid
export function EmailInput() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Handle input change
  // Updates email state and validates input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setError("Please enter a valid email address");
    } else {
      setError("");
    }
  };

  // Handle form submission
  // Validates email before submitting
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    console.log("Email submitted:", email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={handleChange}
          placeholder="Enter your email"
        />
      </label>
      {error && <span className="error">{error}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}

