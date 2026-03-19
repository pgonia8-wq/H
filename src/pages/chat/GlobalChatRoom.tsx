import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../supabaseClient";

interface GlobalChatRoomProps {
  currentUserId: string;
  roomId?: string;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  username?: string;
  avatar_url?: string;
  content: string;
  created_at?: string;
}

const GlobalChatRoom: React.FC<GlobalChatRoomProps> = ({
  currentUserId,
  roomId = "premium_global_chat",
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [goldMessages, setGoldMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [goldSubscribed, setGoldSubscribed] = useState(false);
  const [showGoldChat, setShowGoldChat] = useState(false);
  const [usersConnected] = useState(42);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Load Classic Messages
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const { data, error } = await supabase
          .from("global_chat_messages")
          .select("*")
          .eq("room_id", roomId)
          .order("created_at", { ascending: true })
          .limit(50);

        if (error) setLoadError(error.message);
        else setMessages(data || []);
      } catch (err: any) {
        setLoadError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [roomId]);

  // Load Gold Messages
  useEffect(() => {
    if (!goldSubscribed || !showGoldChat) return;
    const loadGoldMessages = async () => {
      try {
        const { data } = await supabase
          .from("gold_chat_messages")
          .select("*")
          .order("created_at", { ascending: true })
          .limit(50);
        setGoldMessages(data || []);
      } catch (err) {
        console.error("Error cargando Gold Chat:", err);
      }
    };
    loadGoldMessages();
  }, [goldSubscribed, showGoldChat]);

  // Realtime Classic Chat
  useEffect(() => {
    const channel = supabase.channel(`global-chat-${roomId}`);
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "global_chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => setMessages((prev) => [...prev, payload.new as ChatMessage])
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.user !== currentUserId) {
          setTyping(true);
          setTimeout(() => setTyping(false), 2000);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [currentUserId, roomId]);

  // Realtime Gold Chat
  useEffect(() => {
    if (!goldSubscribed || !showGoldChat) return;
    const channel = supabase.channel(`gold-chat`);
    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "gold_chat_messages" },
        (payload) => setGoldMessages((prev) => [...prev, payload.new as ChatMessage])
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [goldSubscribed, showGoldChat]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, goldMessages, showGoldChat]);

  const sendTyping = async () => {
    const channel = supabase.channel(`global-chat-${roomId}`);
    await channel.send({
      type: "broadcast",
      event: "typing",
      payload: { user: currentUserId },
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const table = showGoldChat ? "gold_chat_messages" : "global_chat_messages";
    const payload: any = showGoldChat
      ? { sender_id: currentUserId, content: newMessage.trim() }
      : { sender_id: currentUserId, room_id: roomId, content: newMessage.trim() };

    const { error } = await supabase.from(table).insert(payload);
    if (!error) setNewMessage("");
  };

  const handleGoldSubscribe = () => {
    setGoldSubscribed(true);
    // Se queda en Gold Chat después de suscribirse
  };

  const toggleChatMode = () => {
    setShowGoldChat(!showGoldChat);
  };

  const isGold = showGoldChat && goldSubscribed;

  const renderMessage = (m: ChatMessage) => (
    <div
      key={m.id}
      className={`flex gap-3 items-end ${
        m.sender_id === currentUserId ? "justify-end" : "justify-start"
      }`}
    >
      {m.sender_id !== currentUserId && (
        <img
          src={m.avatar_url || "/default-avatar.png"}
          alt="avatar"
          className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-700"
        />
      )}

      <div
        className={`max-w-[75%] px-4 py-3 rounded-3xl text-[15px] leading-relaxed shadow-md ${
          m.sender_id === currentUserId
            ? isGold
              ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-black rounded-br-none"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none"
            : "bg-gray-800 text-gray-100 rounded-bl-none"
        }`}
      >
        {m.sender_id !== currentUserId && (
          <p className="text-xs font-semibold mb-1 opacity-90">
            {m.username || m.sender_id?.slice(0, 8)}
          </p>
        )}
        <p>{m.content}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <div
        className="w-full max-w-[380px] flex flex-col overflow-hidden rounded-3xl shadow-2xl border border-white/10"
        style={{ height: "620px", background: "#0a0a0f" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{
            background: isGold
              ? "linear-gradient(135deg, #92400e, #d97706, #f59e0b)"
              : "linear-gradient(135deg, #5b21b6, #6d28d9, #7c3aed)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
              {isGold ? "👑" : "🌍"}
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">
                {isGold ? "Gold Chat" : "Global Chat"}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {usersConnected} conectados
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {goldSubscribed && (
              <button
                type="button"
                onClick={toggleChatMode}
                className="px-4 py-1.5 text-xs font-medium rounded-full bg-white/20 hover:bg-white/30 text-white transition"
              >
                {showGoldChat ? "Global" : "Gold"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-3xl text-white hover:bg-white/20 rounded-full transition"
            >
              ×
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0a0a0f] scrollbar-thin scrollbar-thumb-gray-700">
          {loading && <p className="text-center text-gray-400 py-12">Cargando mensajes...</p>}

          {loadError && (
            <div className="p-4 bg-red-900/50 text-red-200 rounded-2xl text-center">
              {loadError}
            </div>
          )}

          {!loading && !loadError && (showGoldChat ? goldMessages : messages).length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg text-gray-300">No hay mensajes aún</p>
              <p className="text-sm text-gray-500 mt-2">Sé el primero en escribir algo interesante</p>
            </div>
          )}

          {(showGoldChat ? goldMessages : messages).map(renderMessage)}

          {typing && (
            <div className="pl-12 text-xs text-gray-400 italic flex items-center gap-2">
              Alguien está escribiendo
              <span className="flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-150">.</span>
                <span className="animate-bounce delay-300">.</span>
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Gold Subscription Screen - Ahora se ve siempre que entres a Gold sin suscribirte */}
        {!goldSubscribed && showGoldChat && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 px-8 text-center">
            <div className="text-7xl mb-6">👑</div>
            <h3 className="text-3xl font-bold text-amber-400 mb-3">Gold Chat</h3>
            <p className="text-gray-400 mb-10 max-w-[260px]">
              Accede al chat premium con contenido exclusivo y miembros Gold
            </p>
            <button
              onClick={handleGoldSubscribe}
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold rounded-2xl text-lg active:scale-95 transition"
            >
              Suscribirse a Gold
            </button>
            <button
              type="button"
              onClick={() => setShowGoldChat(false)}
              className="mt-6 text-gray-500 hover:text-gray-400 text-sm"
            >
              Volver a Global Chat
            </button>
          </div>
        )}

        {/* Message Input - Solo se muestra si estás en Global o ya suscrito a Gold */}
        {(!showGoldChat || goldSubscribed) && (
          <div className="p-4 border-t border-white/10 bg-[#0a0a0f]">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  if (e.target.value.trim()) sendTyping();
                }}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-zinc-900 text-white placeholder-gray-500 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="px-7 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-800 disabled:text-gray-500 font-medium rounded-2xl transition active:scale-95"
              >
                Enviar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalChatRoom;
