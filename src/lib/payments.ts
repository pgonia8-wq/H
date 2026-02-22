import { supabase } from './supabase'
import { MiniKit } from '@worldcoin/minikit-js'

const RECEIVER_WALLET = '0xdf4a991bc05945bd0212e773adcff6ea619f4c4b'

export async function handlePayment(userWallet: string, label: string, amount = 10) {
  const paymentId = `${label.toLowerCase()}-${Date.now()}`

  await supabase.from('payments').insert({
    id: paymentId,
    wallet: userWallet,
    token: 'WLD',
    amount,
    status: 'pending',
    created_at: new Date()
  })

  if (MiniKit.isInstalled()) {
    try {
      await MiniKit.install()
      await MiniKit.createPayment({
        id: paymentId,
        fromWallet: userWallet,
        toWallet: RECEIVER_WALLET,
        amount,
        token: 'WLD'
      })
    } catch (err) {
      console.error('Error enviando pago con MiniKit:', err)
    }
  }

  return paymentId
    }
