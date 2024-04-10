/*********************************************************************************
    FileName: server.js
    FileVersion: 1.0
    Core Feature(s): Server Initialization
    Purpose: This file initializes the server by connecting to the MongoDB database and starting the Express application.
*********************************************************************************/

const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require('dotenv');

// Loading in environment variables
if(!process.env.ENVIRONMENT) {
  dotenv.config({path:'./config/.env'})
}

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('App connected to database');
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });