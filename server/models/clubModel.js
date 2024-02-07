const mongoose = require("mongoose");

// Boilerplate code
const clubSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    }
  }
);

const Club = mongoose.model('Club', clubSchema);

module.exports = Club;