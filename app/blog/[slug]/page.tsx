// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { fetchPosts } from "@/lib/api";
import Link from "next/link";
import EditButton from "@/components/EditButton";

// Helper to decode HTML entities if they are double-encoded
function decodeHtml(html: string) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function fixDrupalBodyImages(html: string) {
  const baseUrl = process.env.NEXT_PUBLIC_DRUPAL_API_URL;
  if (!baseUrl || !html) return html;

  // Ensure we are working with a clean string
  return html.replace(
    /<img([^>]+)src="\/([^"]+)"/g,
    `<img$1src="${baseUrl}/$2"`
  );
}

function stripInlineStyles(html: string) {
  if (!html) return "";
  return html.replace(/style="[^"]*"/g, "");
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  const posts = await fetchPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) return notFound();

  let rawContent = post.content || "";

  // 2. Fix the most common "double encoding" issue 
  // (Only if you literally see <p> on the screen)
  if (rawContent.includes("&lt;")) {
    rawContent = rawContent
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, "&");
  }

  // 3. Run your cleaners
  const processedHTML = fixDrupalBodyImages(stripInlineStyles(rawContent));

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Breadcrumbs postTitle={post.title} />

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      <div className="text-sm text-gray-600 mb-2">
        <p className="text-xs text-gray-500 mb-2">
          {new Date(post.createdDate).toLocaleDateString("en-GB")} | by  <a href={`/authors/${post.authorId}`} className="text-blue-600 hover:underline" > {post.author} </a>
        </p>
      </div>

      {/* Edit Button - Only shows if logged in (Checked in Client Component) */}
      <EditButton id={post.id} />

      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          width={800}
          height={400}
          className="object-contain w-full max-h-96 mb-6"
        />
      )}

      <article className="prose prose-lg prose-blue max-w-none">
        <div dangerouslySetInnerHTML={{ __html: processedHTML }} />
      </article>

      {post.tags?.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Tags:</h4>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="text-xs bg-gray-200 px-2 py-0.5 rounded hover:bg-gray-300"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
