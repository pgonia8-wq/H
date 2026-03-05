export default async function handler(request) {

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {

    const body = await request.json();
    const { plan } = body;

    console.log("Upgrade request:", plan);

    return new Response(
      JSON.stringify({
        success: true,
        plan: plan || null
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (err) {

    console.error("API ERROR:", err);

    return new Response(
      JSON.stringify({
        success: false,
        error: err.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );

  }

      }
