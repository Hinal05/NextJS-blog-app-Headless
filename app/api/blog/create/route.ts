// app/api/blog/create/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, content, userId, csrfToken } = await req.json();

    const payload = {
      data: {
        type: "node--blog",
        attributes: {
          title,
          body: { value: content, format: "basic_html" },
        },
        relationships: {
          uid: {
            data: { type: "user--user", id: userId }
          }
        }
      },
    };

    const res = await fetch(`${process.env.DRUPAL_API_URL}/jsonapi/node/blog`, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        "X-CSRF-Token": csrfToken, // Important!
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(await res.text());

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}