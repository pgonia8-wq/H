import { useEffect, useState } from 'react'
import { supabase } from './supabaseClients'
import { MiniKit } from '@worldcoin/minikit-js'

export function useMiniKitUser() {
  const [wallet, setWallet] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const miniKit = new MiniKit({
          wallet: '0xdf4a991bc05945bd0212e773adcff6ea619f4c4b',
        })

        const userWallet = await miniKit.getUser?.()
        if (userWallet) {
          setWallet(userWallet)
          await supabase
            .from('users')
            .upsert({ wallet: userWallet }, { onConflict: 'wallet' })
        }
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  return { wallet, loading }
}
