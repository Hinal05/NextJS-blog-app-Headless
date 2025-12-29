'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

// Utility to convert slug to Title Case
function slugToTitle(slug: string) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function Breadcrumbs({ postTitle }: { postTitle?: string }) {
  const pathname = usePathname(); // e.g. "/blog/react", "/tags/App%20Router"
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = [{ name: "Home", href: "/" }];

  // /blog page
  if (segments.length === 1 && segments[0] === "blog") {
    crumbs.push({ name: "Blog", href: "/blog" });
  }

  // /blog/[slug] page
  else if (segments.length === 2 && segments[0] === "blog" && postTitle) {
    crumbs.push({ name: "Blog", href: "/blog" });
    crumbs.push({ name: postTitle, href: pathname });
  }

  // /tags/[tag] page
  else if (segments.length === 2 && segments[0] === "tags") {
    // ✅ Decode the tag from URL
    const tagName = decodeURIComponent(segments[1]);
    crumbs.push({ name: `${tagName}`, href: pathname });
  }

  // Static pages like /about, /contact
  else if (segments.length === 1) {
    crumbs.push({
      name: slugToTitle(segments[0]),
      href: pathname,
    });
  }

  return (
    <nav className="text-sm text-gray-600 mb-4">
      {crumbs.map((crumb, index) => (
        <span key={crumb.href}>
          <Link href={crumb.href} className="hover:underline text-blue-600">
            {crumb.name}
          </Link>
          {index < crumbs.length - 1 && <span className="mx-1">/</span>}
        </span>
      ))}
    </nav>
  );
}
