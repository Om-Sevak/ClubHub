// Packages
const express = require("express");
const session = require("express-session");
const crypto = require('crypto');
const dotenv = require('dotenv');
const cors = require('cors');

// Routing Endpoints
const clubRouter = require("./routes/clubRoutes");
const authRouter = require("./routes/authRoutes");
const clubroleRouter = require("./routes/clubroleRoutes");
const interestRouter = require("./routes/interestRoutes");

// Middleware

// Loading in environment variables
if(!process.env.ENVIRONMENT) {
    dotenv.config({path:'./config/.env'})
}

const app = express();

app.use(express.json());

// Session handled soley by server. 
// When client clears cookie data, server clears session data (on page close)
// Only https on prod. Requires sameSite flag as 'none' due to static page proxy nature
const cookieSetting = (process.env.ENVIRONMENT == "PRODUCTION") ? { secure: true, sameSite: "none" } : {}; 
app.set('trust proxy', 1)
app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(16).toString('hex'),
    resave: false,
    saveUninitialized: true,
    cookie: cookieSetting
}));

// Credentials not included on default
app.use(cors({
    origin: process.env.ORIGIN, 
    methods: 'GET,PUT,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
    exposedHeaders: 'Content-Range,X-Content-Range',
    optionsSuccessStatus: 204,
  })); 

// defining routes
app.use('/club', clubRouter);

app.use('/login', authRouter);

app.use('/register', authRouter);

app.use('/role', clubroleRouter);

app.use('/auth', authRouter);

app.use('/interest', interestRouter);

app.get("/", (req, res) => {
    res.send("App is up");
});

//exporting app
module.exports = app;
