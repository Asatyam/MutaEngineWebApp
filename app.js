const express = require('express');
const connectDB =require('./helpers/mongodb');
const session = require('express-session');
const cors = require('cors');
const auth = require("./controllers/authentication")
const passport = require('passport');
const { setUpPassport } = require('./helpers/passport');

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
setUpPassport(passport);
app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post("/signup", auth.signup);


app.listen(process.env.PORT, () => {
  console.log(`Starting the server on ${process.env.PORT}`);
});
