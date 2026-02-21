import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { handlePayment } from './lib/payments'
import FeedPage from './pages/FeedPage'
import AuthPage from './pages/AuthPage'

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseError, setSupabaseError] = useState(false)
  const [envLogs, setEnvLogs] = useState("")

  useEffect(() => {
    // Mostrar variables de entorno en pantalla para debug
    setEnvLogs(
      `VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL || 'undefined'}\n` +
      `VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'undefined'}`
    )

    if (!supabase) {
      console.error('Supabase client is not initialized!')
      setSupabaseError(true)
      setLoading(false)
      return
    }

    const session = supabase.auth.session()
    setUser(session?.user ?? null)
    setLoading(false)

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener?.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xl">
        Cargando...
      </div>
    )
  }

  if (supabaseError) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-red-500 text-white p-4 text-center">
        <p>Error: Supabase no inicializado. Revisa tus variables de entorno.</p>
        <pre className="mt-4 text-sm">{envLogs}</pre>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="w-screen h-screen flex flex-col">
        <AuthPage />
        <pre className="p-2 bg-white text-purple-700 rounded mt-2">{envLogs}</pre>
      </div>
    )
  }

  const handlePremiumPayment = async () => {
    const paymentId = handlePayment('Premium')
    console.log('Iniciando pago con ID:', paymentId)
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-purple-400 to-pink-400 text-white flex flex-col">
      <header className="p-4 text-2xl font-bold text-center">Human App</header>

      <main className="flex-1 overflow-auto p-4">
        <FeedPage />
        <pre className="p-2 bg-white text-purple-700 rounded mt-2">{envLogs}</pre>
      </main>

      <footer className="p-4 flex justify-center gap-4">
        <button
          onClick={handlePremiumPayment}
          className="bg-white text-purple-500 rounded-full px-6 py-2 font-semibold shadow-lg hover:scale-105 transition-transform"
        >
          Premium
        </button>
      </footer>
    </div>
  )
}

export default App
