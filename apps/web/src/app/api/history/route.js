import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const results = await sql`
      SELECT * FROM saved_results 
      ORDER BY created_at DESC 
      LIMIT ${limit} 
      OFFSET ${offset}
    `;

    return Response.json(results);
  } catch (error) {
    console.error("Get history error:", error);
    return Response.json({ error: "Failed to get history" }, { status: 500 });
  }
}
