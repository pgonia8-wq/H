// Error #6 corregido: se reemplaza la API de Supabase Realtime v1 deprecada
// (.on().subscribe() y removeSubscription()) por la API v2 correcta (.channel().on().subscribe())

import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Repeat2, CheckCircle2 } from 'lucide-react';
import { ThemeContext } from '../lib/ThemeContext';

const notifIcon = (type: string) => {
  const base = "w-3.5 h-3.5";
  switch (type) {
    case "like":     return <Heart className={`${base} text-pink-500`} />;
    case "comment":  return <MessageCircle className={`${base} text-blue-400`} />;
    case "follow":   return <UserPlus className={`${base} text-emerald-400`} />;
    case "mention":  return <AtSign className={`${base} text-violet-400`} />;
    case "repost":   return <Repeat2 className={`${base} text-emerald-400`} />;
    case "verified": return <CheckCircle2 className={`${base} text-sky-400`} />;
    default:         return <Bell className={`${base} text-gray-400`} />;
  }
};

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setNotifications(data);
    };

    fetchNotifications();

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className={`min-h-screen px-6 py-8 ${isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f8f9fa] text-gray-900"}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
        >
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            Notificaciones
          </h2>
          {notifications.length > 0 && (
            <p className="text-xs font-medium text-violet-400">
              {notifications.length} notificacion{notifications.length !== 1 ? "es" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Empty state */}
      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center animate-fade-in">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))", border: "1px solid rgba(99,102,241,0.2)" }}
          >
            <Bell className="w-9 h-9 text-indigo-400" />
          </div>
          <div>
            <p className={`text-base font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Sin notificaciones
            </p>
            <p className={`text-sm mt-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
              Las actividades de tu cuenta aparecerán aquí.
            </p>
          </div>
        </div>
      )}

      {/* Notifications list */}
      <div className="flex flex-col gap-2">
        {notifications.map((n, i) => (
          <div
            key={n.id}
            className={`
              flex items-start gap-3 p-4 rounded-2xl border transition-all duration-200
              animate-fade-in
              ${isDark
                ? "bg-[#111113] border-white/[0.07] hover:bg-white/[0.03]"
                : "bg-white border-gray-100 hover:bg-gray-50 shadow-sm"
              }
            `}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {/* Avatar / icon */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
            >
              {(n.user || n.message || "?")[0]?.toUpperCase()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-snug ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                {n.message}
              </p>
              <p className={`text-xs mt-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                {new Date(n.created_at).toLocaleString("es", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Type badge */}
            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${isDark ? "bg-white/[0.06]" : "bg-gray-100"}`}>
              {notifIcon(n.type)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
