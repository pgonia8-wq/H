import { useState, useEffect } from 'react'
import { supabase } from './supabaseClients'
import { MiniKit } from '@worldcoin/minikit-js'

export const useMiniKitUser = () => {
  const [wallet, setWallet] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const miniKit = new MiniKit({ wallet: null })
      const userWallet = await miniKit.getWallet?.()
      if (userWallet) {
        setWallet(userWallet)
        const user = supabase.auth.user()
        if (user) {
          await supabase
            .from('users')
            .upsert({ id: user.id, wallet: userWallet })
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  return { wallet, loading }
}
