// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { fetchPosts } from "@/lib/api";

function fixDrupalBodyImages(html: string) {
  const baseUrl = process.env.NEXT_PUBLIC_DRUPAL_API_URL;

  if (!baseUrl) return html;

  return html.replace(
    /<img([^>]+)src="\/([^"]+)"/g,
    `<img$1src="${baseUrl}/$2"`
  );
}

function stripInlineStyles(html: string) {
  return html.replace(/style="[^"]*"/g, "");
}

export async function generateStaticParams() {
  const posts = await fetchPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: any) {
  const { slug } = params;

  const posts = await fetchPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) return notFound();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Breadcrumbs postTitle={post.title} />

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      <div className="text-sm text-gray-600 mb-2">
        | <span>
          {/* {post.createdDateFormatted} */}
            {new Date(post.createdDate).toLocaleDateString("en-GB")}
          </span> | by <span>{post.author}</span>
        <p className="text-xs text-gray-500 mb-2">
          {new Date(post.createdDate).toLocaleDateString("en-GB")} | by {post.author}
        </p>
      </div>

      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          width={800}
          height={400}
          className="object-contain w-full max-h-96 mb-6"
        />
      )}

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{
          __html: fixDrupalBodyImages(stripInlineStyles(post.content)),
        }}
      />

      {post.tags?.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Tags:</h4>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="bg-gray-200 text-black px-2 py-1 rounded text-sm">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
