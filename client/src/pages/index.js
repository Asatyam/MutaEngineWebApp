import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Home() {
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (router.isReady) {
        const queryToken = router.query.token; // Assuming the query param is named "token"
        if (queryToken) {
          setToken(queryToken);
          localStorage.setItem('token', queryToken);
        }
      }
    } else {
      setToken(token);
    }
  }, [router.isReady, router.query.token]);


  const handleLogout = (e) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    localStorage.clear();
    setToken("");
    router.push("/");
    axios
      .post('http://localhost:4000/auth/logout', config)
      .catch(console.log);
  };
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-3xl font-bold mb-8">Available Actions</h1>
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
            onClick={(e)=>router.push("/checkout")}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
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
