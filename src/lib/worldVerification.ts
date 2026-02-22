import { supabase } from './supabaseClient'

export async function verifyWorldIDProof(proof: any) {
  const user = supabase.auth.user()
  if (!user) throw new Error('Usuario no autenticado')

  const { data, error } = await supabase
    .rpc('verify_world_id_proof', {
      p_user_id: user.id,
      p_proof: proof,
    })

  if (error) throw error
  return data // { is_valid: boolean, message: string }
}
