import React, { useEffect, useState } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import { supabase } from "./lib/supabase"
import FeedPage from "./pages/FeedPage"

const App: React.FC = () => {
  const [wallet, setWallet] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        if (!MiniKit.isInstalled()) {
          setLoading(false)
          return
        }

        await MiniKit.install()

        const user = await MiniKit.getUser()

        if (!user?.walletAddress) {
          setLoading(false)
          return
        }

        setWallet(user.walletAddress)

        await supabase.from("users").upsert({
          id: user.walletAddress,
          world_id: user.nullifierHash,
          created_at: new Date()
        })

      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

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
