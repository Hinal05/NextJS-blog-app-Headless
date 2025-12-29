'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

// Utility to convert slug to Title Case
function slugToTitle(slug: string) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

type BreadcrumbsProps = {
  postTitle?: string;   // For blog posts
  tagName?: string;     // For tag pages
  authorName?: string;  // For author pages
};

export default function Breadcrumbs({ postTitle, tagName, authorName }: BreadcrumbsProps) {
  const pathname = usePathname(); // e.g. "/blog/react", "/tags/App%20Router"
  const crumbs = [{ name: "Home", href: "/" }];

  // Blog post page
  if (postTitle) {
    crumbs.push({ name: postTitle, href: pathname });
  }

  // Tag page
  else if (tagName) {
    crumbs.push({ name: tagName, href: pathname });
  }

  // Author page
  else if (authorName) {
    crumbs.push({ name: authorName, href: pathname });
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
