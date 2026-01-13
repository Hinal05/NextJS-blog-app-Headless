'use client';

import { useState, useEffect, useMemo } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";

const ITEMS_PER_PAGE = 4;

/* ✅ Helper: remove HTML tags safely */
function stripHtml(html: string) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

type Post = {
  id: string;
  slug: string;
  title: string;
  content: string;
  image?: string;
  author: string;
  authorId: string;
  createdDate: string;
  tags: string[];
};

export default function BlogList({ posts: initialPosts }: { posts: Post[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [posts] = useState(initialPosts);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);

  /* ✅ Collect unique tags for dropdown */
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((post) => {
      post.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();

    const filtered = posts.filter((post) => {
      const title = post.title?.toLowerCase() ?? "";
      const content = stripHtml(post.content ?? "").toLowerCase();

      const matchesSearch =
        title.includes(q) || content.includes(q);

      const matchesTag =
        selectedTag === "all" ||
        post.tags?.includes(selectedTag);

      return matchesSearch && matchesTag;
    });

    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdDate).getTime();
      const dateB = new Date(b.createdDate).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredPosts(sorted);
    setCurrentPage(1);
  }, [searchQuery, sortOrder, selectedTag, posts]);

  /* Pagination */
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="p-8">
      <Breadcrumbs />

      <h2 className="text-2xl font-bold mb-6">Blog Posts</h2>

      <a
        href="/blog/add"
        className="inline-block bg-green-600 text-white px-4 py-2 rounded mb-6 hover:bg-green-700"
      >
        + Add New Blog
      </a>

      {/* Search + Sort + Tag Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded"
        />

        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="all">All tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* Posts Grid */}
      {paginatedPosts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
            {paginatedPosts.map((post) => {
              const plainText = stripHtml(post.content ?? "");

              return (
                <div
                  key={post.id}
                  className="bg-white p-4 rounded shadow hover:scale-105 transition overflow-hidden"
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

                    {/* Excerpt */}
                    <p className="text-sm text-gray-600">
                      {plainText.slice(0, 80)}
                      {plainText.length > 80 && "..."}
                    </p>

                    {/* Tags */}
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
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
                    )}
                  </a>
                  <AuthEditWrapper id={post.id} />
                  <p className="text-sm text-gray-600 mt-2">
                    {plainText.slice(0, 80)}...
                  </p>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1 ? "bg-black text-white" : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AuthEditWrapper({ id }: { id: string }) { // Ensure this is the UUID
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('csrf_token'));
  }, []);

  if (!isLoggedIn) return null;

  return (
    <Link 
      href={`/blog/edit/${id}`} // This MUST be the UUID from node.id
      className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded hover:bg-yellow-500"
    >
      EDIT
    </Link>
  );
}
