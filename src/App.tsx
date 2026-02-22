import React from 'react'
import FeedPage from './pages/FeedPage'
import { useMiniKitUser } from './lib/useMiniKitUser'

const App: React.FC = () => {
  const { wallet, loading } = useMiniKitUser()

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        Cargando...
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white text-center p-6">
        Esta aplicación solo funciona dentro de World App.
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col">
      <header className="p-4 text-xl font-bold text-center">
        Human Feed
      </header>
      <main className="flex-1 overflow-auto p-4">
        <FeedPage wallet={wallet} />
      </main>
    </div>
  )
}

export default App
