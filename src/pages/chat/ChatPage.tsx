import React from 'react'
import ChatRoom from './ChatRoom.tsx'

const ChatPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Cabecera con botón de volver */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex items-center">
        <button
          onClick={() => window.history.back()}  // vuelve a Home
          className="text-purple-400 text-2xl mr-4 font-bold"
        >
          ←
        </button>
        <h1 className="text-xl font-bold">Chat en Vivo</h1>
      </div>

      {/* Chat ocupa todo el espacio */}
      <div className="flex-1 overflow-hidden">
        <ChatRoom roomId="general" />  {/* sala general por ahora */}
      </div>
    </div>
  )
}

export default ChatPage
