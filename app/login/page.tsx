'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ name: '', pass: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DRUPAL_API_URL}/user/login?_format=json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (res.ok) {
        const data = await res.json();
        // Store session data
        localStorage.setItem('csrf_token', data.csrf_token);
        localStorage.setItem('logout_token', data.logout_token);
        localStorage.setItem('current_user', JSON.stringify(data.current_user));
        
        router.push('/blog');
        router.refresh();
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Connection to Drupal failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 border rounded"
          onChange={(e) => setCredentials({ ...credentials, name: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          onChange={(e) => setCredentials({ ...credentials, pass: e.target.value })}
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Log In
        </button>
      </form>
    </div>
  );
}