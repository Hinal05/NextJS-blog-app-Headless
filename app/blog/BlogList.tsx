'use client';

import { useState, useEffect } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";

const ITEMS_PER_PAGE = 4;

export default function BlogList({ posts: initialPosts }: { posts: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [posts] = useState(initialPosts);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const q = searchQuery.toLowerCase();

    const filtered = posts.filter((post) => {
      const title = post.title?.toLowerCase() ?? "";
      const content = post.content?.toLowerCase() ?? "";
      return title.includes(q) || content.includes(q);
    });

    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdDate).getTime();
      const dateB = new Date(b.createdDate).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredPosts(sorted);
    setCurrentPage(1); // reset page on search/sort
  }, [searchQuery, sortOrder, posts]);

  // Pagination logic
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

      {/* Search + Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded"
        />

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
            {paginatedPosts.map((post) => (
              <div
                key={post.slug}
                className="bg-white p-4 rounded shadow hover:scale-105 transition"
              >
                <a href={`/blog/${post.slug}`}>
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-40 object-contain mb-4"
                  />
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {new Date(post.createdDate).toLocaleDateString("en-GB")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {(post.content ?? "").slice(0, 60)}
                    {(post.content ?? "").length > 60 && "..."}
                  </p>
                </a>
              </div>
            ))}
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
                    currentPage === i + 1
                      ? "bg-black text-white"
                      : ""
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
