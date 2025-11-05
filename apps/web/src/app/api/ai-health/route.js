export async function GET() {
  try {
    const url = "/integrations/google-gemini-2-5-pro/";

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "ping" }],
      }),
    });

    const text = await res.text();

    return Response.json(
      {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        endpoint: url,
        sample: text.slice(0, 300),
      },
      { status: res.ok ? 200 : 502 },
    );
  } catch (e) {
    return Response.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
