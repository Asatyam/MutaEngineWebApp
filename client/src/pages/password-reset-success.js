import React from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const PasswordResetSuccess = () => {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push('/');
    }, 5000);
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="max-w-md p-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Password Reset Email Sent</h1>
        <p className="text-gray-700 mb-6">
          We have sent an email with instructions to reset your password. Please
          check your inbox and follow the link provided to reset your password.
        </p>
        <p className="text-blue-500">Redirecting you to the homepage...</p>
      </div>
    </div>
  );
};

export default PasswordResetSuccess;
