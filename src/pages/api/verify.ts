
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyCloudProof } from "@worldcoin/minikit-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { payload, action, signal } = req.body;

    if (!payload || !action) {
      return res.status(400).json({ error: "Missing payload or action" });
    }

    const app_id = process.env.APP_ID || "app_18e24371c2f0aeaa6348745bf40add01";

    const verifyRes = await verifyCloudProof(payload, app_id, action, signal);

    if (verifyRes.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ success: false, error: "Proof invalid" });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
