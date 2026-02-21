import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { handlePayment } from './lib/payments'
import FeedPage from './pages/FeedPage'
import AuthPage from './pages/AuthPage'

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseError, setSupabaseError] = useState(false)

  // Verifica sesión de Supabase al iniciar
  useEffect(() => {
    if (!supabase) {
      console.error('Supabase client is not initialized!')
      setSupabaseError(true)
      setLoading(false)
      return
    }

    const session = supabase.auth.session()
    setUser(session?.user ?? null)
    setLoading(false)

    // Escucha cambios de auth
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      authListener?.unsubscribe()
    }
  }, [])

  // Mensaje mientras carga
  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xl">
        Cargando...
      </div>
    )
  }

  // Mensaje si Supabase no inicializó
  if (supabaseError) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-red-500 text-white text-xl p-4">
        Error: Supabase no inicializado. Revisa tus variables de entorno.
      </div>
    )
  }

  // Si no hay usuario logueado
  if (!user) {
    return <AuthPage />
  }

  // Función ejemplo de pago
  const handlePremiumPayment = async () => {
    const paymentId = handlePayment('Premium')
    console.log('Iniciando pago con ID:', paymentId)
    // Aquí integrarías MiniKit o World ID
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-purple-400 to-pink-400 text-white flex flex-col">
      <header className="p-4 text-2xl font-bold text-center">
        Human App
      </header>

      <main className="flex-1 overflow-auto p-4">
        <FeedPage />
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
