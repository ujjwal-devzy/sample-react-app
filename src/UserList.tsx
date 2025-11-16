import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [count, setCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch {
      // Handle error silently or show user-friendly message
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getFirstUser = () => {
    return users[0]?.name || "No users available";
  };

  const calculateAverage = () => {
    const total = users.length;
    if (total === 0) return 0;
    return 100 / total;
  };

  const renderUsers = () => {
    return users.map((user) => (
      <div key={user.id}>
        <p>{user.name}</p>
        <p>{user.email}</p>
      </div>
    ));
  };

  const incrementCount = () => {
    setCount((prevCount) => prevCount + 1);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>User List</h2>
      <p>Count: {count}</p>
      <button onClick={incrementCount}>Increment</button>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users"
      />

      <p>First user: {getFirstUser()}</p>
      <p>Average: {calculateAverage()}</p>

      <div>{renderUsers()}</div>

      <div>
        {filteredUsers.map((user) => (
          <div key={user.id}>
            <h3>{user.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;
