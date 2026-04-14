import { updateUserTotem } from "../lib/updateUserTotem.mjs";

export default async function handler(req, res) {
  try {

    // 🧠 1. validar método
    if (req.method !== "POST") {
      return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
    }

    // 🧠 2. parsear body
    let body;

    try {
      body = typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;
    } catch {
      return res.status(400).json({ error: "INVALID_JSON" });
    }

    const { totem, score } = body;

    // 🧠 3. validaciones básicas
    if (!totem || typeof score !== "number") {
      return res.status(400).json({ error: "INVALID_INPUT" });
    }

    // 🧠 4. ejecutar update
    const tx = await updateUserTotem(totem, score);

    // 🧠 5. respuesta
    return res.json({
      success: true,
      tx: tx.hash,
    });

  } catch (err) {

    console.error("❌ updateTotem error:", err);

    return res.status(500).json({
      error: "INTERNAL_ERROR"
    });
  }
}
