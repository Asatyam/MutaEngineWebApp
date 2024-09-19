// pages/password-reset-request.js
import React, { useState } from 'react';
import axios from 'axios';

const PasswordResetRequest = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/password-reset-request', { email });
      setMessage('Password reset email sent');
    } catch (error) {
        console.log(error);
      setMessage('Error sending password reset email');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">
          Password Reset Request
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange = {(e)=>setEmail(e.target.value)}
              autoComplete="email"
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Request Password Reset
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-center ${
              message.includes('Error') ? 'text-red-500' : 'text-green-500'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default PasswordResetRequest;
