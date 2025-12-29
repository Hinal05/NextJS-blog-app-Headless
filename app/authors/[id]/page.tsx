// app/authors/[id]/page.tsx
import { fetchAuthorById, fetchPostsByAuthor } from "@/lib/api";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

type Post = {
  slug: string;
  title: string;
  image?: string;
  createdDateFormatted?: string;
};

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Next.js 15 requires awaiting params
  const { id } = await params;

  const author = await fetchAuthorById(id);
  const posts: Post[] = await fetchPostsByAuthor(id);

  if (!author) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold">Author not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Breadcrumbs authorName={author.displayName} />
      {/* Author Profile */}
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        {author.image && (
          <img
            src={author.image}
            alt={author.displayName}
            className="w-32 h-32 rounded-full object-cover border"
          />
        )}

        <div>
          <h1 className="text-3xl font-bold">
            {author.displayName}
          </h1>

          <p className="text-gray-500">@{author.username}</p>

          {author.bio && (
            <div
              className="prose mt-4 max-w-none"
              dangerouslySetInnerHTML={{ __html: author.bio }}
            />
          )}
        </div>
      </div>

      {/* Author Posts */}
      <h2 className="text-2xl font-semibold mb-6">
        Posts by {author.displayName}
      </h2>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="border rounded-lg p-4 hover:shadow-lg transition"
            >
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-40 object-cover rounded mb-3"
                />
              )}

              <h3 className="text-lg font-semibold">
                {post.title}
              </h3>

              <p className="text-sm text-gray-500">
                {post.createdDateFormatted}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
