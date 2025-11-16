import { useState, useEffect } from "react";

interface User {
  name: string;
  email: string;
}

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch(`https://api.example.com/users/${userId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((error) => console.error("Fetch error:", error));
  }, [userId]);

  return (
    <div>
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
      <p>Count: {count}</p>
    </div>
  );
}
