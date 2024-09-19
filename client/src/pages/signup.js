import Link from 'next/link';
import {useGoogleReCaptcha} from "react-google-recaptcha-v3";
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Signup() {

      const { executeRecaptcha } = useGoogleReCaptcha('signup');
      const [confirm, setConfirm] = useState('');
      const initial = {
        email: '',
        password: '',
        firstName: '',
        lastName: ''

      };
      const router = useRouter();
      const [form, setForm] = useState(initial);

      const handleSignup = async (e) => {
        e.preventDefault();
        const token = await executeRecaptcha('login');
        console.log(token);
        const body = {
          ...form,
          recaptcha: token,
        };
        const url = `http://localhost:4000/auth/signup`;
        axios
          .post(url, body)
          .then((res) => {
            const token = res.data.token;
            localStorage.setItem('token', token);
            router.push('/');
          })
          .catch((err) => {
            console.log(err);
          });
      };
      const handleFormChange = (e) => {
        setForm({
          ...form,
          [e.target.name]: e.target.value,
        });
      };

      const handleConfirmChange = (e)=>{
        setConfirm(e.target.value);
      }

  const handleGoogleSignup = (e) => {
    window.location.href = 'http://localhost:4000/auth/google';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">
          Sign up
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* First Name */}
            <div>
              <label htmlFor="first-name" className="sr-only">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleFormChange}
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="First Name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="last-name" className="sr-only">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleFormChange}
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Last Name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleFormChange}
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleFormChange}
                autoComplete="new-password"
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                value={confirm}
                onChange={handleConfirmChange}
                type="password"
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign up
            </button>
            <div className="relative justify-start text-sm">
              <p>
                Already have an account?{' '}
                <Link href="/login">
                  <span className=" text-blue-500">Login</span>
                </Link>
              </p>
            </div>
          </div>

          <div className="relative flex justify-center">
            <span className="px-2 text-sm text-gray-500">or</span>
          </div>

          {/* Sign up with Google */}
          <div>
            <button
              onClick={handleGoogleSignup}
              type="button"
              className="relative flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                className="w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#4285F4"
                  d="M24 9.5c3.9 0 7.1 1.4 9.7 3.6l7.1-7.1C36.5 2.2 30.7 0 24 0 14.6 0 6.5 5.8 2.5 14.2l8.2 6.4C13.3 12.2 18.2 9.5 24 9.5z"
                />
                <path
                  fill="#34A853"
                  d="M46.5 24.5c0-1.5-.1-3-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.2 5.6c4.2-3.8 7-9.4 7-16.3z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.7 28.6c-1.2-.6-2.2-1.4-3.1-2.3l-8.2 6.4c2.9 5.8 8.3 10.2 14.9 11.8l7.1-5.6c-5.6-1.5-10.3-5.6-11.9-11.2z"
                />
                <path
                  fill="#EA4335"
                  d="M24 46c6.5 0 12-2.2 16-6l-7.2-5.6c-2.2 1.4-4.9 2.3-7.8 2.3-5.8 0-10.7-3.7-12.5-8.9l-8.2 6.4C6.5 42.2 14.6 46 24 46z"
                />
              </svg>
              Sign up with Google
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
