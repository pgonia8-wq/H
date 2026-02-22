import React, { useEffect, useState } from 'react'
import FeedPage from './pages/FeedPage'
import { useMiniKitUser } from './useMiniKitUser'
import { verifyWorldIDProof } from './worldVerification'

const App: React.FC = () => {
  const { wallet, loading } = useMiniKitUser()
  const [verified, setVerified] = useState(false)
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    const verify = async () => {
      if (!wallet) {
        setVerifying(false)
        return
      }
      try {
        const proof = await window.MiniKit?.getProof?.()
        if (!proof) {
          setVerifying(false)
          return
        }
        const { isValid } = await verifyWorldIDProof(proof)
        setVerified(isValid)
      } finally {
        setVerifying(false)
      }
    }
    verify()
  }, [wallet])

  if (loading || verifying) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        Cargando...
      </div>
    )
  }

  if (!wallet || !verified) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white text-center p-6">
        Esta aplicación solo funciona dentro de World App y con World ID verificado.
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
