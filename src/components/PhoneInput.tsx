import { useState } from "react";
import { validatePhone } from "../utils/validation";

// PhoneInput component for phone form input
// Handles phone validation and user input
// Shows error message if phone is invalid
export function PhoneInput() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  // Handle input change
  // Updates phone state and validates input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    if (value && !validatePhone(value)) {
      setError("Please enter a valid phone number");
    } else {
      setError("");
    }
  };

  // Handle form submission
  // Validates phone before submitting
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phone)) {
      setError("Please enter a valid phone number");
      return;
    }
    console.log("Phone submitted:", phone);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Phone:
        <input
          type="tel"
          value={phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
        />
      </label>
      {error && <span className="error">{error}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}

