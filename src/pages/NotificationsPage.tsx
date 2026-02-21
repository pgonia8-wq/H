import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setNotifications(data);
    };
    fetchNotifications();

    const subscription = supabase
      .from('notifications')
      .on('INSERT', () => fetchNotifications())
      .subscribe();

    return () => supabase.removeSubscription(subscription);
  }, []);

  return (
    <div className="p-4 flex flex-col space-y-2">
      <h2 className="text-2xl font-bold mb-4">Notificaciones</h2>
      {notifications.length === 0 && <p>No tienes notificaciones.</p>}
      {notifications.map((n) => (
        <div key={n.id} className="p-2 bg-white shadow rounded">
          <p>{n.message}</p>
          <small className="text-gray-500">{new Date(n.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};

export default NotificationsPage;
