import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import ActionButton from '../components/ActionButton';

const HomePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const sessionUser = supabase.auth.user();
    setUser(sessionUser);
  }, []);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <h1 className="text-4xl font-bold text-purple-800 mb-6">Bienvenido a Human</h1>
      {user && (
        <div className="bg-white shadow-md rounded-xl p-4 w-full max-w-md flex flex-col items-center gap-2">
          <p className="text-lg font-semibold">{user.email}</p>
          <p>ID: {user.id}</p>
          <ActionButton label="Verificar World ID" onClick={() => alert('Aquí va World ID')} />
        </div>
      )}
    </div>
  );
};

export default HomePage;
