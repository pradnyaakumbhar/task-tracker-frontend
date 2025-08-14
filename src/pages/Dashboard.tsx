import React from 'react';
import { useAuth } from '../context/authContext';
import type { User } from '../context/authContext';

const Dashboard: React.FC = () => {
  const { user }: { user: User | null; logout: () => void } = useAuth();
  console.log(user);
  

  return (
    <div className="min-h-screen bg-gray-50">
      dashboard
    </div>
  );
};

export default Dashboard