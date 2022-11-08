const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require('./joi_schemas.js'); // Joi npm validates schemas and spits out more sensical error messages.
const ExpressError = require('./utilities/ExpressError.js') // This is a custom made error message generator which tacks on assigned message and status code in addition to default error message.

module.exports.logMiddleware = (req, res, next) => {
  console.log("log")
  console.log(req.body);
  console.log(req.files);
  next();
}

module.exports.validateCampground = function(req , res , next){
// gets the error message from Joi validator and passes it to error handler to display
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',') // This bullshit is because error is an array of objects. This maps out array getting the message from each element and joining them with a comma if multiple.
    throw new ExpressError(msg, 400)
  } else {
    next();
  }
}

module.exports.isLoggedIn = (req, res, next)=>{
  if (!req.isAuthenticated()) {
    console.log(req.originalUrl);
    req.session.returnTo = req.originalUrl;
    req.flash('error', "you must be logged in");
    return res.redirect('/login');
  }
  next();
}


module.exports.isAuthor = async function (req, res, next) {
  const campground = await Campground.findById(req.params.id);
  if (!campground.author.equals(req.user._id)) {
    req.flash('error',"You do not have permission to edit this campground");
    return res.redirect(`/campgrounds/${req.params.id}`);
  }
  next();
}

module.exports.isReviewAuthor = async function (req, res, next) {
  const review = await Review.findById(req.params.reviewID);
  if (!review.author.equals(req.user._id)) {
    req.flash('error',"You do not have permission to delete this review");
    return res.redirect(`/campgrounds/${req.params.id}`);
  }
  next();
}

// server side model validation middleware. Passes req.body to Joi model for validation and passes any error messages to Error handler.
module.exports.validateReview = (req, res, next)=> {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next();
  }
}
