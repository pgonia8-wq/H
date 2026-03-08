export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const nonce = crypto.randomBytes(32).toString('hex');
  console.log("[NONCE] Generado:", nonce);

  return res.status(200).json({ nonce });
}
