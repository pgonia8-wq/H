import { supabase } from './supabaseClient'
import { miniKit } from './miniKitClient'

export function usePayments() {
  async function createPayment(label: string, amount: number, token = 'WLD', wallet?: string) {
    const paymentId = `${label.toLowerCase()}-${Date.now()}`
    const targetWallet = wallet || (await miniKit.getUser())?.walletAddress

    await supabase.from('payments').insert({
      id: paymentId,
      wallet: targetWallet,
      token,
      amount,
      status: 'pending',
      created_at: new Date(),
    })

    return paymentId
  }

  return { createPayment }
}
