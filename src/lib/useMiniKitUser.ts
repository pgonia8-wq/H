import { useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { supabase } from './supabaseClient'

export function useMiniKitUser() {
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

        await supabase.from('users').upsert({
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

  return { wallet, loading }
        }
