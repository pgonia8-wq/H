import { supabase } from './supabaseClient'

export function usePayments() {
  const handlePayment = async (label: string, amount: number, wallet: string) => {
    const paymentId = `${label.toLowerCase()}-${Date.now()}`

    await supabase.from('payments').insert({
      id: paymentId,
      wallet,
      token: 'WLD',
      amount,
      status: 'pending',
      created_at: new Date()
    })

    return paymentId
  }

  return { handlePayment }
}
