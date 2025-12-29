// lib/api.ts
// lib/api.ts
type NormalizedPost = {
  slug: string;
  title: string;
  content: string;
  image: string;
  author: string;
  authorId: string;
  createdDate: string;
  createdDateFormatted: string;
  tags: string[];
};

export async function fetchPosts(): Promise<NormalizedPost[]> {
  try {
    const apiBase = process.env.DRUPAL_API_URL;
    if (!apiBase) throw new Error("DRUPAL_API_URL is not defined");

    const res = await fetch(`${apiBase}/jsonapi/node/blog?include=uid,field_image,field_tags`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Fetch failed with status:', res.status);
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const json = await res.json();
    const included = json.included || [];

    return json.data.map((node: any) => {
      const { attributes, relationships } = node;
      const slug = attributes.path?.alias?.split('/').pop() || '';
      const createdDate = attributes.created;
      const createdDateFormatted = new Date(createdDate).toLocaleDateString('en-GB');
      const content = attributes.field_body?.processed || attributes.field_body?.value || "";

      // Author
      const uidRel = relationships.uid?.data;
      const authorObj = included.find(
        (inc: any) => inc.type === 'user--user' && inc.id === uidRel?.id
      );
      const author = authorObj?.attributes.display_name || authorObj?.attributes.name || 'Unknown';
      const authorId = authorObj?.id || 'unknown';

      // Image
      const imgRel = relationships.field_image?.data;
      const imgObj = included.find(
        (inc: any) => inc.type === 'file--file' && inc.id === imgRel?.id
      );
      const image = imgObj
        ? `${apiBase.replace(/\/$/, '')}/${imgObj.attributes.uri.url.replace(/^\//, '')}`
        : '';

      // Tags
      const tags: string[] = (relationships.field_tags?.data || [])
        .map((tagRef: any) => {
          const tagTerm = included.find(
            (inc: any) => inc.type === 'taxonomy_term--tags' && inc.id === tagRef?.id
          );
          return tagTerm?.attributes.name;
        })
        .filter(Boolean);

      return {
        slug,
        title: attributes.title,
        content,
        image,
        author,
        authorId,
        createdDate,
        createdDateFormatted,
        tags,
      };
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    return [];
  }
}

export async function fetchAuthorById(id: string) {
  try {
    const res = await fetch(`${process.env.DRUPAL_API_URL}/jsonapi/user/user/${id}?include=user_picture`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error("❌ Author fetch failed:", res.statusText);
      return null;
    }

    const json = await res.json();
    console.log("🔥 RAW user JSON:", JSON.stringify(json, null, 2));

    const user = json.data;
    const included = json.included || [];

    if (!user || !user.attributes) {
      console.warn("⚠️ User attributes missing or malformed:", user);
      return null;
    }

    const attr = user.attributes;
    console.log("🧠 Parsed attributes:", attr);

    // Extract profile picture
    let imageUrl = null;
    const pictureRel = user.relationships?.user_picture?.data;
    if (pictureRel?.id) {
      const imageObj = included.find((i: any) => i.type === 'file--file' && i.id === pictureRel.id);
      if (imageObj?.attributes?.uri?.url) {
        imageUrl = `${process.env.DRUPAL_API_URL}${imageObj.attributes.uri.url}`;
      }
    }

    const normalizedAuthor = {
      id: user.id,
      displayName: attr.display_name ?? attr.name ?? "Unnamed",
      username: attr.name ?? "N/A",
      email: attr.mail ?? "N/A",
      bio: attr.field_bio?.processed ?? '',
      image: imageUrl,
    };

    console.log("✅ Normalized author object:", normalizedAuthor);
    return normalizedAuthor;

  } catch (err) {
    console.error("❌ Error in fetchAuthorById:", err);
    return null;
  }
}



export async function fetchPostsByAuthor(authorId: string) {
  try {
    const res = await fetch(
      `${process.env.DRUPAL_API_URL}/jsonapi/node/blog?filter[uid.id]=${authorId}&include=uid,field_image,field_tags`,
      { cache: "no-store" }
    );

    const json = await res.json();
    console.log("Author post fetch raw data:", JSON.stringify(json, null, 2));

    const included = json.included || [];

    return json.data.map((node: any) => {
      const { attributes, relationships } = node;
      const slug = attributes.path.alias?.split("/").pop() || "";

      const createdDate = attributes.created;
      const createdDateFormatted = new Date(createdDate).toLocaleDateString("en-GB");
      const content = attributes.field_body;

      // Author
      const uidRel = relationships.uid?.data;
      const authorObj = included.find(
        (i: any) => i.type === "user--user" && i.id === uidRel?.id
      );
      const author = authorObj?.attributes.display_name || "Unknown";
      const authorId = authorObj?.id || "unknown";

      // Image
      const imgRel = relationships.field_image?.data;
      const imgObj = included.find(
        (i: any) => i.type === "file--file" && i.id === imgRel?.id
      );
      const image = imgObj
        ? `${process.env.DRUPAL_API_URL}/${imgObj.attributes.uri.url}`
        : "";

      // Tags
      const tags: string[] = (relationships.field_tags?.data || [])
        .map((tagRef: any) => {
          const tagTerm = included.find(
            (inc: any) =>
              inc.type === "taxonomy_term--tags" && inc.id === tagRef.id
          );
          return tagTerm?.attributes.name;
        })
        .filter(Boolean);

      return {
        slug,
        title: attributes.title,
        content,
        image,
        author,
        authorId,
        createdDate,
        createdDateFormatted,
        tags,
      };
    });
  } catch (err) {
    console.error("Error in fetchPostsByAuthor:", err);
    return [];
  }
}

export async function createBlogPost({
  title,
  content,
  image,
}: {
  title: string;
  content: string;
  image?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
      debugger;
    console.log(localStorage, 'localStorage');
    const apiBase = process.env.NEXT_PUBLIC_DRUPAL_API_URL;
    const csrfToken = localStorage.getItem('csrf_token');
    const username = localStorage.getItem('username');

    if (!csrfToken || !username) {
      return { success: false, message: 'Missing CSRF token or user not logged in' };
    }

    // Get the user ID from Drupal
    const userRes = await fetch(`${apiBase}/jsonapi/user/user?filter[name]=${username}`);
    const userJson = await userRes.json();
    const userId = userJson?.data?.[0]?.id;

    if (!userId) {
      return { success: false, message: 'Failed to retrieve user ID' };
    }

    const res = await fetch(`${apiBase}/jsonapi/node/blog`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      'X-CSRF-Token': csrfToken,
    },
    credentials: 'include', // ✅ Required for cookies
    body: JSON.stringify({
      data: {
        type: 'node--blog',
        attributes: {
          title,
          field_body: content,
          status: true,
        },
        relationships: {
          uid: {
            data: {
              type: 'user--user',
              id: userId,
            },
          },
        },
      },
    }),
  });


    if (!res.ok) {
      const error = await res.text();
      console.error('Error creating blog post:', error);
      return { success: false, message: 'Failed to create blog post' };
    }

    return { success: true, message: 'Blog post created successfully' };
  } catch (err) {
    console.error('Error:', err);
    return { success: false, message: 'Unexpected error occurred during blog post creation.' };
  }
}
