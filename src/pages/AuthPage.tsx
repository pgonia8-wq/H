import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import ActionButton from '../components/ActionButton';

const AuthPage: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Revisa tu email para continuar');
      onLoginSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50 p-4">
      <h1 className="text-4xl font-bold text-purple-800 mb-6">Human Auth</h1>
      <input
        type="email"
        placeholder="Tu correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4 px-4 py-2 rounded-lg border border-gray-300 w-full max-w-sm"
      />
      <ActionButton label={loading ? 'Enviando...' : 'Login / Registro'} onClick={handleLogin} />
      {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
    </div>
  );
};

export default AuthPage;
