const express = require("express");
const app = express();
const clubRouter = require("./routes/clubRoutes");
const authRouter = require("./routes/authRoutes");
const cors = require('cors');
// Middleware

app.use(express.json());

app.use(cors());

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
//   });  

// defining routes
app.use('/club', clubRouter);

app.use('/login', authRouter);

app.use('/register', authRouter);

app.get("/", (req, res) => {
    res.send("App is up");
});

//exporting app
module.exports = app;
