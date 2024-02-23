const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require('dotenv');

// Loading in environment variables
if(!process.env.MONGO_URI) {
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