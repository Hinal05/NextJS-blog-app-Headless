// app/tags/[tag]/page.tsx
import Breadcrumbs from "@/components/Breadcrumbs";
import { fetchPosts } from "@/lib/api";

function stripHtml(html: string) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

// generate static paths
export async function generateStaticParams() {
  const posts = await fetchPosts();
  const tagSet = new Set<string>();

  posts.forEach((post) => post.tags?.forEach((tag) => tagSet.add(tag)));

  return Array.from(tagSet).map((tag) => ({ tag }));
}

// ✅ Next.js 15: no manual type for props
export default async function TagPage({ params }: any) {
  // ✅ Decode URL param to match original tag names
  const tag = decodeURIComponent(params.tag);

  const posts = await fetchPosts();

  const filteredPosts = posts.filter((post) => post.tags?.includes(tag));

  return (
    <div className="p-8">
      <Breadcrumbs />

      <h2 className="text-2xl font-bold mb-6">
        Posts tagged: <span className="text-blue-600">{tag}</span>
      </h2>

      {filteredPosts.length === 0 ? (
        <p>No posts found for this tag.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
          {filteredPosts.map((post: any) => {
            const excerpt = stripHtml(post.content ?? "").slice(0, 80);
            return (
              <div
                key={post.slug}
                className="bg-white p-4 rounded shadow hover:scale-105 transition"
              >
                <a href={`/blog/${post.slug}`}>
                  {post.image && (
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-40 object-contain mb-4"
                    />
                  )}
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdDate).toLocaleDateString("en-GB")}
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    by{" "}
                    <a
                      href={`/authors/${post.authorId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {post.author}
                    </a>
                  </p>
                  <p className="text-sm text-gray-600">
                    {excerpt}
                    {excerpt.length >= 80 && "..."}
                  </p>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
