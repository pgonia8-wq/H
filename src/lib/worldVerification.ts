import { supabase } from './supabase'

export async function verifyWorldIDProof(proof: any, walletAddress: string) {
  const { data, error } = await supabase
    .rpc('verify_world_id_proof', {
      p_wallet_address: walletAddress,
      p_proof: proof,
    })

  if (error) throw error
  return data // { is_valid, message }
}
