import { useState, useEffect } from 'react';
import { usersApi } from '@/services/api';

export default function TestUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users...');
        const response = await usersApi.getAll({ per_page: 10 });
        console.log('Response:', response);
        setUsers(response.data || []);
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1>Test Users Page</h1>
      <p>Users count: {users.length}</p>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}