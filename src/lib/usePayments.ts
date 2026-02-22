import { supabase } from './supabaseClients'

export function usePayments() {
  const handlePayment = async (label: string, amount: number) => {
    const paymentId = `${label.toLowerCase()}-${Date.now()}`

    const user = supabase.auth.user()
    if (!user) throw new Error('Usuario no autenticado')

    await supabase.from('payments').insert({
      id: paymentId,
      wallet: user.walletAddress,
      token: 'WLD',
      amount,
      status: 'pending',
      created_at: new Date(),
    })

    return paymentId
  }

  return { handlePayment }
}
