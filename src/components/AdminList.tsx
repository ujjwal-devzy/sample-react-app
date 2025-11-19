import { useState, useEffect } from 'react';
import { formatDateString } from '../utils/formatters';

interface Admin {
  id: number;
  name: string;
  role: string;
  assignedDate: string;
}

export const AdminList = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching admins...");
    const fetchAdmins = () => {
      setTimeout(() => {
        const dummyAdmins: Admin[] = [
          { id: 1, name: 'Admin One', role: 'Admin', assignedDate: '2022-05-01' },
          { id: 2, name: 'Super Admin', role: 'SuperAdmin', assignedDate: '2021-11-20' },
        ];
        setAdmins(dummyAdmins);
        setLoading(false);
        console.log("Admins fetched");
      }, 1000);
    };

    fetchAdmins();
  }, []);

  if (loading) {
    return <div>Loading admins...</div>;
  }

  return (
    <div className="admin-list">
      <h2>Admin List</h2>
      <ul>
        {admins.map((admin, index) => (
          <li key={index}> 
            <strong>{admin.name}</strong> - {admin.role} (Assigned: {formatDateString(admin.assignedDate)})
          </li>
        ))}
      </ul>
    </div>
  );
};

