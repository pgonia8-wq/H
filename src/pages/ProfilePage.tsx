import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import ActionButton from '../components/ActionButton';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [reputation, setReputation] = useState(0);
  const [wldBalance, setWldBalance] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      const sessionUser = supabase.auth.user();
      setUser(sessionUser);

      if (sessionUser) {
        const { data } = await supabase
          .from('user_reputation')
          .select('*')
          .eq('user_id', sessionUser.id)
          .single();
        if (data) setReputation(data.score);

        const { data: balanceData } = await supabase
          .from('user_tokens')
          .select('wld_balance')
          .eq('user_id', sessionUser.id)
          .single();
        if (balanceData) setWldBalance(balanceData.wld_balance);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      {user && (
        <div className="bg-white shadow-md rounded-xl p-4 w-full max-w-md flex flex-col items-center gap-2">
          <p className="text-lg font-semibold">{user.email}</p>
          <p>Reputación: {reputation}</p>
          <p>Balance WLD: {wldBalance}</p>
          <ActionButton label="Verificar World ID" onClick={() => alert('Aquí va World ID')} />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
