import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    const data = await response.json();
    setUsers(data);
    setLoading(false);
  };

  const filteredUsers = users.filter(
    (user) => user.name.includes(searchTerm) || user.email.includes(searchTerm)
  );

  const handleDelete = (id: number) => {
    users.splice(
      users.findIndex((u) => u.id === id),
      1
    );
    setUsers(users);
  };

  const averageAge =
    users.reduce((sum, user) => sum + user.age, 0) / users.length;

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users..."
      />
      {loading && <p>Loading...</p>}
      <ul>
        {filteredUsers.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email} - Age: {user.age}
            <button onClick={() => handleDelete(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <p>Average Age: {averageAge}</p>
    </div>
  );
}
