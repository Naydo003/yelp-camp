const mongoose = require('mongoose');
const Review = require('./review');
const User = require('./user');
const Schema = mongoose.Schema;

// creating a separate Image Schema allows us to define a virtual property for the images. Otherwise this would have remailed inside campground schema.
const ImageSchema = new Schema({
  url: String,
  filename: String
});


// virtual properties allow us to add properties to the already existing information and call it in app.
// This avoids needing to store the new url with w_200 property assigned for every image.
// thumbnail = name we give the property. callback is what we do when property called. w_200 requests to cloudinary to send a image with w_200. This can save sending large images over the net.
ImageSchema.virtual('thumbnail').get(function() {
  return this.url.replace('/upload', '/upload/w_200')
})

// options which allow virtuals to be converted to JSON. Not converted by default
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema], // Array because there is more than 1
    price: Number,
    description: String,
    location: String,
    geometry: {       // This is the format for GeoJSON
      type: {
        type: String,
        enum: ['Point'],   // this could be a point on the map or line, polygon. We just want points
        required: true
      },
      coordinates: {
        type: [ Number ], // note this is in x-y (lon-lat) not lat-lon which is typically found on maps. To make appear in google just swap.
        required: true
      }
    },
    reviews: [
      {
      type: Schema.Types.ObjectID,
      ref: 'Review'
      }
    ],
    author: {
      type: Schema.Types.ObjectID,
      ref: 'User'
    },
}, opts);        // sets the options defined above to this schema

// one-to-many relationships done by nesting IDs in an array as shown
// one-to-a few relationships might just be done by nesting the full review into campground model.
// one-to-millions or for better linkage we may want to nest campground id in review also. Not useful here though.

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 25)}...</p>`
});          // Make sure ` is in same place

// post using findone and delete on CampgroundSchema this gets the campground document just deleted and deletes all Reviews with id in the campground.reviews
CampgroundSchema.post('findOneAndDelete', async function (doc){

  if (doc) {
    await Review.deleteMany({_id: {$in: doc.reviews} })
  }
})

module.exports = mongoose.model('Campground', CampgroundSchema);
