import React, { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  joinedDate: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const unusedVariable = "I am not used";

  const handleDelete = (id: number) => {
    const index = users.findIndex((u) => u.id === id);
    if (index > -1) {
      users.splice(index, 1);
      setUsers(users);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUsers = [
          {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            joinedDate: "2023-01-15",
          },
          {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            joinedDate: "2023-02-20",
          },
          {
            id: 3,
            name: "Bob Johnson",
            email: "bob@example.com",
            joinedDate: "2023-03-10",
          },
        ];

        console.log("Fetched users", mockUsers);
        setUsers(mockUsers);
      } catch (err: any) {
        console.error("Error fetching users", err);
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div
      className="user-list-container"
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        margin: "10px",
      }}
    >
      <h2>User List</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {users.map((user) => (
          <li
            key={user.id}
            style={{ padding: "10px", borderBottom: "1px solid #eee" }}
          >
            <strong>{user.name}</strong> ({user.email})
            <button
              onClick={() => handleDelete(user.id)}
              style={{ marginLeft: "10px", color: "red" }}
            >
              Delete
            </button>
            <br />
            <span style={{ fontSize: "0.8em", color: "#666" }}>
              Joined: {formatDate(user.joinedDate)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
