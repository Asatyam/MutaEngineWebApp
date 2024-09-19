import React from 'react';

const Failure = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Payment Failed!
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Unfortunately, your payment was not successful. Please try again or
          use a different payment method.
        </p>

        <a
          href="/"
          className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 transition"
        >
          Return to Homepage
        </a>
      </div>
    </div>
  );
};

export default Failure;
