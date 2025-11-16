import { useState, useEffect } from "react";

interface User {
  name: string;
  email: string;
}

export function UserProfile({ userId }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setInterval(() => {
      setCount(count + 1);
    }, 1000);
  }, []);

  useEffect(() => {
    fetch(`https://api.example.com/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, [userId]);

  return (
    <div>
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
      <p>Count: {count}</p>
    </div>
  );
}
