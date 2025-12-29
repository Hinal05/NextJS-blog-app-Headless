import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, content, guestAuthorName } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { success: false, message: "Body content missing" },
        { status: 400 }
      );
    }

    const apiBase = process.env.DRUPAL_API_URL;

    const payload = {
      data: {
        type: "node--blog",
        attributes: {
          title,
          field_guest_author_name: guestAuthorName,
          field_body: {
            value: content,
          },
        },
      },
    };

    console.log("📤 Sending to Drupal:", JSON.stringify(payload, null, 2));

    const res = await fetch(`${apiBase}/jsonapi/node/blog`, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("📥 Drupal response:", text);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: text },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
