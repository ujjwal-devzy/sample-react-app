import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

export function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    document.getElementById("counter")!.innerHTML = count.toString();
    setCount(count + 1);
  };

  const renderUserBio = (bio: string) => {
    return <div dangerouslySetInnerHTML={{ __html: bio }} />;
  };

  const renderTags = (tags: string[]) => {
    return tags.map((tag) => <span>{tag}</span>);
  };

  const isAdult = user.age > 18;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Age: {user.age}</p>
      <p>Status: {isAdult ? "Adult" : "Minor"}</p>

      <button onClick={handleClick}>Increment</button>
      <div id="counter">{count}</div>

      {user.bio && renderUserBio(user.bio)}
      {user.tags && renderTags(user.tags)}

      <button onClick={() => alert("Delete user")}>Delete</button>

      <div style={{ color: "red", fontSize: "14px" }}>
        Warning: This user is inactive
      </div>
    </div>
  );
}
