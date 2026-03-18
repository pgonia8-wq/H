import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../supabaseClient";

interface GlobalChatRoomProps {
  currentUserId: string; // ID de Worldcoin
  roomId?: string;
}

const GlobalChatRoom: React.FC<GlobalChatRoomProps> = ({
  currentUserId,
  roomId = "premium_global_chat",
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true); // nuevo: para mostrar cargando
  const [loadError, setLoadError] = useState<string | null>(null); // nuevo: error visible
  const bottomRef = useRef<HTMLDivElement>(null);

  // Log de montaje inmediato (lo primero que debe salir en consola)
  console.log("🚀 GlobalChatRoom MOUNTED", {
    currentUserId: currentUserId || "UNDEFINED!!!",
    roomId,
    timestamp: new Date().toISOString(),
  });

  // Validación temprana visible
  if (!currentUserId) {
    console.warn("❌ currentUserId NO DEFINIDO → chat no puede funcionar");
    return (
      <div className="h-full bg-red-950 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-red-400">ERROR CRÍTICO</h2>
          <p className="text-xl">No se recibió currentUserId</p>
          <p className="mt-4 opacity-70">Contacta soporte o revisa el componente padre</p>
        </div>
      </div>
    );
  }

  // --- Cargar mensajes iniciales y suscripción ---
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        console.log("Intentando cargar mensajes iniciales...");
        const { data, error } = await supabase
          .from("global_chat_messages")
          .select("*")
          .eq("room_id", roomId)
          .order("created_at", { ascending: true })
          .limit(50);

        if (error) {
          console.error("❌ Error Supabase al cargar mensajes:", error.message);
          setLoadError(`Error al cargar mensajes: ${error.message}`);
        } else {
          console.log("✅ Mensajes cargados exitosamente:", data?.length || 0);
          setMessages(data || []);
        }
      } catch (err: any) {
        console.error("❌ Excepción inesperada en loadMessages:", err);
        setLoadError("Excepción al cargar: " + (err.message || "desconocida"));
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    console.log("Configurando realtime channel...");
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
        (payload) => {
          console.log("📥 NUEVO MENSAJE RECIBIDO:", payload.new);
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        console.log("✏️ Typing broadcast recibido:", payload);
        if (payload.payload.user !== currentUserId) {
          setTyping(true);
          setTimeout(() => setTyping(false), 2000);
        }
      })
      .subscribe((status) => {
        console.log("Estado de suscripción al canal:", status);
      });

    return () => {
      console.log("🧹 Cerrando canal realtime:", channel);
      supabase.removeChannel(channel);
    };
  }, [currentUserId, roomId]);

  // Scroll automático
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendTyping = async () => {
    if (!currentUserId) return;
    try {
      const channel = supabase.channel(`global-chat-${roomId}`);
      await channel.send({
        type: "broadcast",
        event: "typing",
        payload: { user: currentUserId },
      });
      console.log("Typing enviado");
    } catch (err) {
      console.error("❌ Error al enviar typing:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      console.log("Enviando mensaje:", newMessage.trim());
      const { error } = await supabase.from("global_chat_messages").insert({
        room_id: roomId,
        sender_id: currentUserId,
        content: newMessage.trim(),
      });
      if (error) {
        console.error("❌ Error al insertar mensaje:", error.message);
      } else {
        setNewMessage("");
        console.log("Mensaje enviado OK");
      }
    } catch (err) {
      console.error("❌ Excepción al enviar mensaje:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white border border-gray-800 rounded min-h-screen">
      {/* DEBUG HEADER – siempre visible al montar */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4 text-center border-b border-purple-700">
        <h2 className="text-xl font-bold">Global Chat Debug Mode</h2>
        <p className="text-sm opacity-80 mt-1">
          User: {currentUserId.slice(0, 10)}... | Room: {roomId}
        </p>
      </div>

      {/* Estado de carga / error */}
      {loading && (
        <div className="p-6 text-center text-gray-300">
          <p className="text-lg">Cargando mensajes...</p>
        </div>
      )}

      {loadError && (
        <div className="p-6 bg-red-950/80 text-red-300 border border-red-700 rounded m-4">
          <p className="font-bold">Error al cargar chat:</p>
          <p>{loadError}</p>
          <p className="text-sm mt-2 opacity-80">Revisa consola y permisos de Supabase</p>
        </div>
      )}

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/60">
        {messages.length === 0 && !loading && !loadError ? (
          <div className="text-center text-gray-500 py-10">
            <p className="text-lg">No hay mensajes aún</p>
            <p className="text-sm mt-2">Sé el primero en escribir</p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id || Math.random()}
              className={`flex ${m.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-xl ${
                  m.sender_id === currentUserId
                    ? "bg-purple-700 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                <span className="text-xs opacity-70 block mb-1">
                  {m.sender_id?.slice(0, 10)}...
                </span>
                {m.content}
              </div>
            </div>
          ))
        )}

        {typing && (
          <div className="text-xs text-gray-400 italic pl-4">
            Alguien está escribiendo...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input de mensaje */}
      <div className="flex gap-2 p-4 border-t border-gray-800 bg-gray-900">
        <input
          type="text"
          className="flex-1 bg-gray-800 px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-600"
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            sendTyping();
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          className="bg-purple-600 px-6 py-3 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default GlobalChatRoom;
