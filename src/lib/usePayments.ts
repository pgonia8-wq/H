import { supabase } from './supabaseClients'

export const usePayments = () => {
  const handlePayment = async (label: string, amount: number) => {
    const user = supabase.auth.user()
    if (!user) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        label,
        amount,
      })
      .select()
      .single()

    if (error) throw error
    return data?.id
  }

  return { handlePayment }
}
