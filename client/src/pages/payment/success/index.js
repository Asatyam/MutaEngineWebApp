import React from 'react';

const Success = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful!
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Thank you for your purchase. Your payment has been successfully
          processed.
        </p>

        <a
          href="/"
          className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  );
};

export default Success;
