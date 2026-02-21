
import React, { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    setSession(supabase.auth.session());
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return session ? <HomePage /> : <AuthPage onLoginSuccess={() => {}} />;
};

export default App;
