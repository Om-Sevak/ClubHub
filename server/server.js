const express = require('express');
const dotenv = require('dotenv');
const mongoose = require("mongoose");
dotenv.config({path:'./config/.env'})

const app = express();

//Middleware
app.use(express.json());

const clubRouter = require("./routes/clubRoutes");

app.use('/club', clubRouter);

app.get("/", (req, res) => {
    res.send("App is up");
});

const PORT = 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('App connected to database');
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });