import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Home() {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    if (!token) {
      if (router.isReady) {
        const queryToken = router.query.token;
        const email = router.query.email;
        if (queryToken) {
          setToken(queryToken);
          setEmail(email);
          localStorage.setItem('token', queryToken);
          localStorage.setItem('email', email);
        }
      }
    } else {
      setToken(token);
      setEmail(email);
    }
  }, [router.isReady, router.query.token]);

  const handleLogout = (e) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    axios
      .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, config)
      .then((res) => {
        localStorage.clear();
        setToken('');
        setEmail('');
        router.push('/');
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status == 401) {
            localStorage.clear();
            router.push('/login');
          }
        }
      });
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Available Actions</h1>
      {email && (
        <h2 className="text-lg font-semibold text-gray-800 mt-4">
          Your email: <span className="text-indigo-600">{email}</span>
        </h2>
      )}{' '}
      <div className="flex flex-col gap-6 w-full max-w-xs">
        {!token && (
          <button
            onClick={(e) => {
              router.push('/login');
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Login
          </button>
        )}

        {token && (
          <button
            onClick={handleLogout}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        )}
        {token && (
          <button
            onClick={(e) => router.push('/checkout')}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            Purchase
          </button>
        )}

        <button
          onClick={(e) => {
            router.push('/signup');
          }}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New Account
        </button>
      </div>
    </div>
  );
}
