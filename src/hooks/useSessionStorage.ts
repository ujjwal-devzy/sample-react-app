import { useState, useEffect } from "react";

// Custom hook for sessionStorage management
// Stores and retrieves values from sessionStorage
// Returns [value, setValue] similar to useState
export function useSessionStorage<T>(key: string, initialValue: T) {
  // Initialize state with value from sessionStorage or initial value
  // Checks sessionStorage on mount
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from sessionStorage:", error);
      return initialValue;
    }
  });

  // Update sessionStorage when value changes
  // Saves new value to sessionStorage
  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Error saving to sessionStorage:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}

