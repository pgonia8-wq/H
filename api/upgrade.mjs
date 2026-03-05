export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { plan } = req.body || {};

    console.log("Upgrade request:", plan);

    return res.status(200).json({
      success: true,
      plan: plan || null
    });

  } catch (err) {

    console.error("API ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message
    });

  }

}
