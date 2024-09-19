const stripe = require('stripe')(process.env.STRIPE_KEY);
require('dotenv').config();

const calculateTotalAmount = (items) => {
  return 100;
};

exports.createCheckoutSession = async (req, res) => {
  const { items } = req.body;
  console.log(items);
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/payment/failed`,
    });
    console.log(session);
    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
