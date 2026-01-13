'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Editor, EditorProvider } from 'react-simple-wysiwyg';

export default function EditBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params); 
  const router = useRouter();
  const [formData, setFormData] = useState({ title: '', content: '', id: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_DRUPAL_API_URL;
        const res = await fetch(`${apiBase}/jsonapi/node/blog/${slug}`);
        
        if (!res.ok) throw new Error("Post not found");
        
        const json = await res.json();
        const post = json.data;

        setFormData({
          id: post.id,
          title: post.attributes.title,
          content: post.attributes.field_body?.value || '',
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const csrfToken = localStorage.getItem('csrf_token');

    const payload = {
      data: {
        type: 'node--blog',
        id: formData.id,
        attributes: {
          title: formData.title,
          field_body: { 
            value: formData.content, 
            format: 'plain_text' // Or 'full_html' based on your Drupal config
          },
        },
      },
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_DRUPAL_API_URL}/jsonapi/node/blog/${formData.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
        'X-CSRF-Token': csrfToken || '',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Post updated successfully!");
      router.push(`/blog`);
      router.refresh();
    } else {
      const errorData = await res.json();
      alert(`Update failed: ${errorData.errors?.[0]?.detail || "Check console"}`);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading post...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Blog Post</h1>
      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Post Title</label>
          <input 
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <div className="min-h-[400px]">
            <EditorProvider>
              <Editor 
                value={formData.content} 
                onChange={(e) => setFormData({...formData, content: e.target.value})} 
                containerProps={{ style: { height: '400px', overflow: 'auto' } }}
              />
            </EditorProvider>
          </div>
        </div>

        <div className="flex gap-4 pt-10">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-semibold transition">
            Save Changes
          </button>
          <button type="button" onClick={() => router.back()} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-md font-semibold transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}