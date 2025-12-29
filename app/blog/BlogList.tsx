'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function BlogList({ posts: initialPosts }: { posts: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState(initialPosts);
  const [posts, setPosts] = useState(initialPosts);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    const q = searchQuery.toLowerCase();

    const filtered = (posts ?? []).filter((post) => {
      const title = typeof post.title === "string" ? post.title.toLowerCase() : "";
      const content =
        typeof post.content === "string" ? post.content.toLowerCase() : "";

      return title.includes(q) || content.includes(q);
    });

    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdDate).getTime();
      const dateB = new Date(b.createdDate).getTime();

      return sortOrder === "newest"
        ? dateB - dateA // newest first
        : dateA - dateB; // oldest first
    });

    setFilteredPosts(sorted);
  }, [searchQuery, posts, sortOrder]);

  return (
    <div className="p-8">
      <Breadcrumbs />

      <h2 className="text-2xl font-bold mb-6">Blog Posts</h2>

      <a href="/blog/add" className="inline-block bg-green-600 text-white px-4 py-2 rounded mb-6 hover:bg-green-700">+ Add New Blog</a>

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

      {filteredPosts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
          {filteredPosts.map((post) => (
            <div key={post.slug} className="block bg-white p-4 rounded shadow hover:scale-105 transition">
              <a
                href={`/blog/${post.slug}`}
              >
                <img
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-40 object-contain mb-4"
                />
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <p className="text-sm text-gray-600">
                  {(post.field_body?.value ?? "").slice(0, 60)}
                  {post.field_body?.value && post.field_body.value.length > 60 ? "..." : ""}
                </p>
              </a>
              {/* <p className="text-sm text-gray-600">
                <Link href={`/authors/${post.authorId}`} className="text-blue-600 hover:underline">
                  {post.author}
                </Link>
              </p> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
