import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const {
      generationId,
      transcript,
      finalDescription,
      finalThumbnailTitle,
      finalVideoTitle,
      finalTags,
    } = await request.json();

    if (
      !finalDescription ||
      !finalThumbnailTitle ||
      !finalVideoTitle ||
      !finalTags ||
      !transcript
    ) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Save the user's final choices for learning
    const [savedResult] = await sql`
      INSERT INTO saved_results (
        generation_id,
        transcript,
        final_description,
        final_thumbnail_title,
        final_video_title,
        final_tags
      )
      VALUES (
        ${generationId || null},
        ${transcript},
        ${finalDescription},
        ${finalThumbnailTitle},
        ${finalVideoTitle},
        ${finalTags}
      )
      RETURNING *
    `;

    return Response.json(savedResult);
  } catch (error) {
    console.error("Save results error:", error);
    return Response.json({ error: "Failed to save results" }, { status: 500 });
  }
}
