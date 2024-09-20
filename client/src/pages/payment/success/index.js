import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const Success = () => {
  const router = useRouter();
  const { session_id } = router.query;

  useEffect(() => {
    if (session_id) {
      handleInvoiceGeneration(session_id);
    }
  }, [session_id]);

  const handleInvoiceGeneration = async (session_id) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/payment-success?session_id=${session_id}`
      );
      console.log(res.data);
    } catch (err) {
      console.error('Error generating invoice: ', err);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful!
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Thank you for your purchase. Your payment has been successfully
          processed and the invoice has been sent to your email.
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
