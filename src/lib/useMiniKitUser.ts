import { useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export function useMiniKitUser() {
  const [wallet, setWallet] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      try {
        if (!MiniKit.isInstalled()) {
          setLoading(false)
          return
        }

        await MiniKit.install()
        const u = await MiniKit.getUser()
        if (!u?.walletAddress) {
          setLoading(false)
          return
        }

        setWallet(u.walletAddress)
        setUser(u)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  return { wallet, user, loading }
}
