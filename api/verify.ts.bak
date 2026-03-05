import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyCloudProof } from '@worldcoin/minikit-js'

const APP_ID = 'app_18e24371c2f0aeaa6348745bf40add01'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { proof } = req.body

    if (!proof) {
      return res.status(400).json({ success: false, error: 'Missing proof' })
    }

    // proof ya contiene payload, action y signal dentro
    const { payload, action, signal } = proof

    if (!payload || !action) {
      return res.status(400).json({ success: false, error: 'Invalid proof structure' })
    }

    const result = await verifyCloudProof(
      payload,
      APP_ID,
      action,
      signal
    )

    if (result.success) {
      return res.status(200).json({ success: true })
    } else {
      return res.status(400).json({
        success: false,
        error: result.error || 'Proof invalid'
      })
    }

  } catch (error: any) {
    console.error('Verify error:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

