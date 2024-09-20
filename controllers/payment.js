const stripe = require('stripe')(process.env.STRIPE_KEY);
require('dotenv').config();

const itemsInfo = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  name: `Item ${index + 1}`,
  price: (index + 1) * 10,
}));

exports.getItemsList = (req, res) => {
  return res.status(200).json({ items: itemsInfo });
};

exports.createCheckoutSession = async (req, res) => {
  const { items } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: itemsInfo[item.id].price * 100,
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/failed`,
    });
    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
