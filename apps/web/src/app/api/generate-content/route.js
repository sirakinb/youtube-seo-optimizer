import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { transcript } = await request.json();

    if (!transcript || transcript.trim().length === 0) {
      return Response.json(
        { error: "Transcript is required" },
        { status: 400 },
      );
    }

    // --- ensure schema exists (no-ops if already created) ---
    try {
      await sql.transaction((txn) => [
        txn`CREATE TABLE IF NOT EXISTS generations (
          id SERIAL PRIMARY KEY,
          transcript TEXT NOT NULL,
          description TEXT NOT NULL,
          thumbnail_title TEXT NOT NULL,
          video_title TEXT NOT NULL,
          tags TEXT NOT NULL,
          title_options JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        txn`CREATE TABLE IF NOT EXISTS saved_results (
          id SERIAL PRIMARY KEY,
          generation_id INTEGER REFERENCES generations(id) ON DELETE CASCADE,
          final_description TEXT NOT NULL,
          final_thumbnail_title TEXT NOT NULL,
          final_video_title TEXT NOT NULL,
          final_tags TEXT NOT NULL,
          transcript TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        txn`CREATE TABLE IF NOT EXISTS training_examples (
          id SERIAL PRIMARY KEY,
          example_type TEXT NOT NULL CHECK (example_type IN ('title', 'description', 'tags', 'complete')),
          title TEXT,
          description TEXT,
          tags TEXT,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
      ]);
    } catch (e) {
      // If schema creation fails, continue; selects below will surface details
      console.error("Schema ensure failed:", e);
    }

    // Get training examples and saved results for context
    let trainingExamples = [];
    let savedResults = [];
    try {
      trainingExamples =
        await sql`SELECT * FROM training_examples ORDER BY created_at DESC LIMIT 20`;
    } catch (e) {
      console.error("Query training_examples failed:", e);
      trainingExamples = [];
    }
    try {
      savedResults =
        await sql`SELECT * FROM saved_results ORDER BY created_at DESC LIMIT 10`;
    } catch (e) {
      console.error("Query saved_results failed:", e);
      savedResults = [];
    }

    // Build context from past examples
    let contextPrompt = "";

    if (trainingExamples.length > 0) {
      contextPrompt +=
        "\n\nHere are examples of content the user has liked in the past:\n";
      trainingExamples.forEach((example, i) => {
        contextPrompt += `\nExample ${i + 1}:\n`;
        if (example.title) contextPrompt += `Title: ${example.title}\n`;
        if (example.description)
          contextPrompt += `Description: ${example.description}\n`;
        if (example.tags) contextPrompt += `Tags: ${example.tags}\n`;
        if (example.notes) contextPrompt += `Notes: ${example.notes}\n`;
      });
    }

    if (savedResults.length > 0) {
      contextPrompt +=
        "\n\nHere are some of the user's recently chosen content:\n";
      savedResults.forEach((result, i) => {
        contextPrompt += `\nResult ${i + 1}:\n`;
        contextPrompt += `Title: ${result.final_video_title}\n`;
        contextPrompt += `Description: ${result.final_description}\n`;
        contextPrompt += `Tags: ${result.final_tags}\n`;
      });
    }

    // Call AI to generate content (Google Gemini 2.5 Pro)
    const integrationUrl = "/integrations/google-gemini-2-5-pro/";

    const body = {
      messages: [
        {
          role: "system",
          content: `You are an expert YouTube SEO content creator. Generate optimized content for YouTube videos based on transcripts. 
            
Your goal is to:
1. Create compelling, SEO-optimized video descriptions
2. Generate catchy thumbnail titles (short, attention-grabbing)
3. Create 5 different video title options (each optimized for YouTube SEO and click-through rate)
4. Generate relevant tags separated by commas

Focus on:
- Using keywords naturally for SEO
- Creating curiosity and engagement
- Making content discoverable
- Following YouTube best practices
${contextPrompt}

Learn from the user's past preferences and maintain a consistent style that matches their brand.`,
        },
        {
          role: "user",
          content: `Generate YouTube content for this video transcript:\n\n${transcript}`,
        },
      ],
      json_schema: {
        name: "youtube_content",
        schema: {
          type: "object",
          properties: {
            description: { type: "string" },
            thumbnail_title: { type: "string" },
            video_title_options: {
              type: "array",
              items: { type: "string" },
              minItems: 5,
              maxItems: 5,
            },
            tags: { type: "string" },
          },
          required: [
            "description",
            "thumbnail_title",
            "video_title_options",
            "tags",
          ],
          additionalProperties: false,
        },
      },
    };

    let aiResponse;
    try {
      aiResponse = await fetch(integrationUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text().catch(() => "");
        console.error(
          `Gemini generation failed: [${aiResponse.status}] ${aiResponse.statusText} -> ${errorText?.slice(0, 500)}`,
        );
        return Response.json(
          {
            error: "AI generation failed",
            status: aiResponse.status,
            detail:
              aiResponse.statusText ||
              errorText?.slice(0, 200) ||
              "Unknown integration error",
          },
          { status: 502 },
        );
      }
    } catch (e) {
      console.error(`Gemini fetch error:`, e);
      return Response.json(
        {
          error: "Failed to connect to AI service",
          detail: e?.message || "Network error",
        },
        { status: 502 },
      );
    }

    const aiData = await aiResponse.json().catch((e) => {
      console.error("Gemini JSON parse error:", e);
      return { error: e?.message };
    });

    if (aiData?.error) {
      console.error("Gemini response error:", aiData.error);
      return Response.json(
        { error: "Failed to parse AI response", detail: aiData.error },
        { status: 502 },
      );
    }

    let content;
    try {
      content = JSON.parse(aiData.choices?.[0]?.message?.content || "");
    } catch (e) {
      console.error("Gemini content parse error:", e, aiData);
      return Response.json(
        {
          error: "Unexpected AI response format",
          detail: "Could not parse content",
        },
        { status: 502 },
      );
    }

    if (
      !content ||
      !Array.isArray(content.video_title_options) ||
      content.video_title_options.length < 1
    ) {
      console.error("Gemini missing required fields:", content);
      return Response.json(
        { error: "AI response missing required fields" },
        { status: 502 },
      );
    }

    // Save generation to database (do not fail the request if DB write fails)
    let generation = null;
    try {
      const rows = await sql`
        INSERT INTO generations (
          transcript, 
          description, 
          thumbnail_title, 
          video_title, 
          tags, 
          title_options
        )
        VALUES (
          ${transcript},
          ${content.description},
          ${content.thumbnail_title},
          ${content.video_title_options[0]},
          ${content.tags},
          ${JSON.stringify(content.video_title_options)}
        )
        RETURNING *
      `;
      generation = rows?.[0] || null;
    } catch (e) {
      console.error("DB insert generations failed:", e);
      // continue, we'll return content without id
    }

    return Response.json({
      id: generation?.id || null,
      description: content.description,
      thumbnail_title: content.thumbnail_title,
      video_title_options: content.video_title_options,
      tags: content.tags,
      created_at: generation?.created_at || null,
      db_saved: Boolean(generation?.id),
    });
  } catch (error) {
    console.error("Content generation error:", error);
    return Response.json(
      { error: "Failed to generate content", detail: error?.message },
      { status: 500 },
    );
  }
}
