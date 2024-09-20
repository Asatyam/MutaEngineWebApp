const stripe = require('stripe')(process.env.STRIPE_KEY);
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

exports.handlePaymentSuccess = async (req, res) => {
  const { session_id } = req.query;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const lineItems = await stripe.checkout.sessions.listLineItems(session_id);

    const customer_email = session.customer_details.email;
    const customer_name = session.customer_details.name;
    const buyer = { email: customer_email };
    const invoicePath = generateInvoice(lineItems.data, buyer);
    sendInvoiceEmail(customer_email, invoicePath, customer_name);

    res.status(200).json({message: "Successfully mailed the invoice"});
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const generateInvoice = (items, buyer) => {
  const doc = new PDFDocument();
  const invoicePath = path.join(__dirname, 'invoice.pdf');

  doc.pipe(fs.createWriteStream(invoicePath));

  doc.fontSize(20).text('Invoice', { align: 'center' });
  doc.moveDown();
  doc.text(`Buyer Email: ${buyer.email}`, { align: 'left' });
  doc.moveDown(2);

  let grandTotal = 0;

  items.forEach((item, index) => {
    const unitPrice = item.price.unit_amount; // Adjust according to the actual structure of the price object
    const itemTotal = (unitPrice / 100) * item.quantity;
    grandTotal += itemTotal;

    doc.text(
      `${index + 1}. Name: ${item.description}, Price: $${(
        unitPrice / 100
      ).toFixed(2)}, Quantity: ${item.quantity}, Total: $${itemTotal.toFixed(
        2
      )}`
    );
  });

  doc.moveDown();
  doc
    .fontSize(16)
    .text(`Grand Total: $${grandTotal.toFixed(2)}`, { align: 'right' });

  doc.end();
  return invoicePath;
};

const sendInvoiceEmail = (email, invoicePath, buyerName) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_PASSWORD,
    },
  });

  const mailOptions = {
    from: `Satyam Agrawal <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Invoice for your purchase, ${buyerName}`,
    text: `Dear ${buyerName},\n\nThank you for your purchase! Please find the attached invoice.\n\nBest Regards, Satyam Agrawal`,
    attachments: [
      {
        filename: 'invoice.pdf',
        path: invoicePath,
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent successfully:', info.response);
    }
  });
};
