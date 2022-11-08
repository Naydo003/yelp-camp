const mongoose = require('mongoose');

const Schema = mongoose.Schema; // This just avoids the need to write mongoose.Schema below. Not really useful IMO

const reviewSchema = new Schema({
  body: String,
  rating: Number,
  author: {
    type: Schema.Types.ObjectID,
    ref: 'User'
  }

});

module.exports = mongoose.model("Review", reviewSchema);
