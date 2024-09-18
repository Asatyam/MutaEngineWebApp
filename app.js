const express = require('express');
const mongoose = require('mongoose');
const connectDB =require('./helpers/mongodb');
const session = require('express-session');
const cors = require('cors');

const app = express();

connectDB();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended:true}));

app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: true,
    })
)


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(process.env.PORT, () => {
  console.log(`Starting the server on ${process.env.PORT}`);
});
