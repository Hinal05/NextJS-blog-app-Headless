'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function AddBlogPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    guestAuthorName: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await fetch('/api/blog/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(r => r.json());

    if (result.success) {
      router.push('/blog');
    } else {
      alert(`❌ ${result.message}`);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Breadcrumbs postTitle="Add Blog" />
      <h1 className="text-3xl font-bold mb-6">Add New Blog</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
          required
          value={formData.title}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="guestAuthorName"
          placeholder="Your Name"
          required
          value={formData.guestAuthorName}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        {/* <input
          type="text"
          name="image"
          placeholder="Image URL"
          value={formData.image}
          onChange={handleChange}
          className="border p-2 rounded"
        /> */}
        <textarea
          name="content"
          placeholder="Content"
          required
          value={formData.content}
          onChange={handleChange}
          rows={5}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Submit Blog
        </button>
      </form>
    </div>
  );
}
