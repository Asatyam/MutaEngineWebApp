import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
require('dotenv').config();
import { useRouter } from 'next/router';
import axios from 'axios';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutPage = () => {
  const [loading, setLoading] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAllowed(true);
      fetchItems();
    }
  }, [router.isReady, router.query.token, isAllowed]);

  const fetchItems = async () => {
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      const res = await axios.get('http://localhost:4000/items', config);
      const itemsData = res.data.items;
      setItems(itemsData);
      const initialQuantities = itemsData.reduce((acc, item) => {
        acc[item.id] = 0;
        return acc;
      }, {});
      setQuantities(initialQuantities);
    } catch (err) {
      console.log(err);
    }
  };

  const handleQuantityChange = (id, quantity) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: parseInt(quantity, 10),
    }));
  };

  const handleCheckout = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const body = {
      items: items
        .filter((item) => quantities[item.id] > 0)
        .map((item) => ({
          ...item,
          quantity: quantities[item.id] || 0,
        })),
    };
    try {
      const res = await axios.post(
        'http://localhost:4000/create-checkout-session',
        body,
        config
      );
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: res.data.sessionId });
    } catch (err) {
      if (err.response) {
        if (err.response.status == 401) {
          localStorage.clear();
          router.push('/login');
        }
      }
      setLoading(false);
    }
  };

  if (!isAllowed) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Shopping Cart</h1>

      <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Available Items:</h2>
        <div>
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item.id} className="mb-4 flex items-center">
                <span className="flex-1">{item.name}</span>
                <span className="flex-1">${item.price.toFixed(2)}</span>
                <input
                  type="number"
                  min="0"
                  value={quantities[item.id] || 0}
                  onChange={(e) =>
                    handleQuantityChange(item.id, e.target.value)
                  }
                  className="w-16 text-center border rounded-md"
                />
              </div>
            ))
          ) : (
            <p>No items available.</p>
          )}
        </div>

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
