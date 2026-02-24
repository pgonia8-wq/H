import type { NextApiRequest, NextApiResponse } from "next";
import { verifyCloudProof } from "@worldcoin/minikit-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Solo aceptamos POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { payload, action, signal } = req.body;

    if (!payload || !action || !signal) {
      return res.status(400).json({ error: "Missing payload, action, or signal" });
    }

    // 🔑 Nuevo APP_ID
    const app_id = process.env.APP_ID || "app_6a98c88249208506dcd4e04b529111fc";

    // Verificación real en backend
    const verifyRes = await verifyCloudProof(payload, app_id, action, signal);

    if (verifyRes.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ success: false, error: "Proof invalid" });
    }

  } catch (error: any) {
    console.error("API verify error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
  }
