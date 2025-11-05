import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const examples = await sql`
      SELECT * FROM training_examples 
      ORDER BY created_at DESC
    `;

    return Response.json(examples);
  } catch (error) {
    console.error("Get training examples error:", error);
    return Response.json(
      { error: "Failed to get training examples" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { exampleType, title, description, tags, notes } =
      await request.json();

    if (
      !exampleType ||
      !["title", "description", "tags", "complete"].includes(exampleType)
    ) {
      return Response.json(
        { error: "Valid example type is required" },
        { status: 400 },
      );
    }

    const [example] = await sql`
      INSERT INTO training_examples (
        example_type,
        title,
        description,
        tags,
        notes
      )
      VALUES (
        ${exampleType},
        ${title || null},
        ${description || null},
        ${tags || null},
        ${notes || null}
      )
      RETURNING *
    `;

    return Response.json(example);
  } catch (error) {
    console.error("Create training example error:", error);
    return Response.json(
      { error: "Failed to create training example" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    await sql`DELETE FROM training_examples WHERE id = ${id}`;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete training example error:", error);
    return Response.json(
      { error: "Failed to delete training example" },
      { status: 500 },
    );
  }
}
