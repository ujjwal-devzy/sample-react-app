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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    const data = await response.json();
    setUsers(data);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count + 1);
    }, 1000);
  }, []);

  const getFirstUser = () => {
    return users[0]?.name || "No users available";
  };

  const calculateAverage = () => {
    var total = users.length;
    if (total === 0) return 0;
    return 100 / total;
  };

  const renderUsers = () => {
    return users.map((user, index) => (
      <div>
        <p>{user.name}</p>
        <p>{user.email}</p>
      </div>
    ));
  };

  const incrementCount = () => {
    setCount(count + 1);
    setCount(count + 1);
  };

  var filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Rendering UserList component");
  console.log("Users:", users);

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
