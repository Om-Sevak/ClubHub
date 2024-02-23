// Packages
const express = require("express");
const session = require("express-session");
const dotenv = require('dotenv');
const cors = require('cors');

// Routing Endpoints
const clubRouter = require("./routes/clubRoutes");
const authRouter = require("./routes/authRoutes");
const clubroleRouter = require("./routes/clubroleRoutes");

// Middleware

// Loading in environment variables
if(!process.env.ORIGIN) {
    dotenv.config({path:'./config/.env'})
}

const app = express();

app.use(express.json());

// Session handled soley by server. 
// Client cannot edit cookies. 
// When client clears cookie data, server clears session data (on page close)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true }
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

app.get("/", (req, res) => {
    res.send("App is up");
});

//exporting app
module.exports = app;
