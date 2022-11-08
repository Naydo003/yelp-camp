
const Campground = require('../models/campground');
const Review = require('../models/review');


module.exports.createReview = async (req, res)=>{
const campground = await Campground.findById(req.params.id);
const review = new Review(req.body.review);
review.author = req.user._id;
campground.reviews.push(review);
await review.save();
await campground.save();
req.flash('success', "You successfully created a new review");
res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async(req, res)=>{
const { id, reviewID } = req.params; // id must be the same as in app.js doc
console.log(reviewID);
await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewID } }); // pulls the review from the array in campground model.
await Review.findByIdAndDelete(reviewID);
req.flash('success', "You successfully deleted a review");
res.redirect(`/campgrounds/${id}`);
}
