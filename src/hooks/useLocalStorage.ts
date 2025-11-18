import { useState, useEffect } from "react";

// Custom hook for localStorage management
// Stores and retrieves values from localStorage
// Returns [value, setValue] similar to useState
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize state with value from localStorage or initial value
  // Checks localStorage on mount
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  // Saves new value to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}

