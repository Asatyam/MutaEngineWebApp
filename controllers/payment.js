const stripe = require('stripe')(process.env.STRIPE_KEY);
require('dotenv').config();

const calculateTotalAmount = (items) => {
  return 100;
};
exports.createPaymentIntent = async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateTotalAmount(amount),
      currency: 'usd',
      description: 'Testing stripe payment for muta engine assignment',
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.log(err);
    res.send(500).send({ error: 'Internal server error' });
  }
};
