'use client';
import { useEffect, useState } from 'react';
import Link from "next/link";

export default function EditButton({ id }: { id: string }) { // Ensure this is the UUID
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('csrf_token'));
  }, []);

  if (!isLoggedIn) return null;

  return (
    <Link 
      href={`/blog/edit/${id}`} // This MUST be the UUID from node.id
      className="inline-block bg-yellow-500 text-white px-3 py-1 rounded text-sm mb-4"
    >
      EDIT
    </Link>
  );
}
