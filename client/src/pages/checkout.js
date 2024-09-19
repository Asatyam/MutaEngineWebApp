import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
require('dotenv').config();
import { useRouter } from 'next/router';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);


const CheckoutPage = () => {
  const [loading, setLoading] = useState(false);
  const[isAllowed, setIsAllowed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push("/login");
    }
    setIsAllowed(true);
  }, [router.isReady, router.query.token, isAllowed, setIsAllowed]);

  const handleCheckout = async () => {
    setLoading(true);

    const response = await fetch(
      'http://localhost:4000/create-checkout-session',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: 1, name: 'Item 1', price: 1000, quantity: 1 },
            { id: 2, name: 'Item 2', price: 2000, quantity: 2 },
          ],
        }),
      }
    );

    const res = await response.json();
    console.log(res);
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: res.sessionId });
    setLoading(false);
  };

  if (!isAllowed){
        return (
          <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          </div>
        );
  }
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Shopping Cart</h1>

      <div className="bg-gray-50 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Total: $60.00</h2>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {loading ? 'Loading...' : 'Proceed to Checkout'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
