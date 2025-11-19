import { useState, useEffect } from 'react';
import { formatDate } from '../utils/formatters';

interface User {
  id: number;
  name: string;
  role: string;
  joinDate: Date;
}

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = () => {
      setTimeout(() => {
        const dummyUsers: User[] = [
          { id: 1, name: 'Alice', role: 'User', joinDate: new Date('2023-01-01') },
          { id: 2, name: 'Bob', role: 'User', joinDate: new Date('2023-02-15') },
          { id: 3, name: 'Charlie', role: 'User', joinDate: new Date('2023-03-10') },
        ];
        setUsers(dummyUsers);
        setLoading(false);
      }, 1000);
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div class="user-list"> 
      <h2>User List</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.name}</strong> - {user.role} (Joined: {formatDate(user.joinDate)})
          </li>
        ))}
      </ul>
    </div>
  );
};

