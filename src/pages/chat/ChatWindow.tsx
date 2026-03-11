// src/pages/chat/ChatWindow.tsx
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../supabaseClient";

interface ChatWindowProps {
  currentUserId: string;
  otherUserId: string;
  onBack: () => void;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  currentUserId,
  otherUserId,
  onBack
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const conversationId = [currentUserId, otherUserId].sort().join("-");

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel("dm-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("timestamp", { ascending: true });

    if (error) {
      console.error("[CHAT] Error cargando mensajes:", error.message);
      return;
    }

    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    const { error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        receiver_id: otherUserId,
        content: text.trim(),
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error("[CHAT] Error enviando mensaje:", error.message);
      return;
    }

    setText("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <div className="flex items-center gap-3 border-b border-gray-700 pb-2 mb-2">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white"
        >
          ←
        </button>

        <div className="font-bold text-white">
          {otherUserId.slice(0, 10)}
        </div>
      </div>

      {/* MENSAJES */}
      <div className="flex-1 overflow-y-auto space-y-2 px-1">

        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;

          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 py-2 rounded-xl max-w-[70%] text-sm ${
                  mine
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="flex gap-2 mt-2 border-t border-gray-700 pt-2">

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg outline-none"
        />

        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-purple-600 rounded-lg text-white font-medium"
        >
          Enviar
        </button>

      </div>
    </div>
  );
};

export default ChatWindow;
