const express = require("express");
const app = express();
const clubRouter = require("./routes/clubRoutes");

// Middleware
app.use(express.json());

// defining routes
app.use('/club', clubRouter);

app.get("/", (req, res) => {
    res.send("App is up");
});

//exporting app
module.exports = app;
