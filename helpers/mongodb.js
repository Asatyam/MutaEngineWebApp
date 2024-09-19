const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

module.exports = async function connectDB() {
  try {
    const mongoDB = process.env.MONGO_URL;
    mongoose.set('strictQuery', false);
    mongoose.connect(mongoDB);
    const db = mongoose.connection;
    console.log('Database succesfully connected');
    db.on('error', console.error.bind(console, 'mongo connection error'));
  } catch (err) {
    console.log(err);
  }
};
