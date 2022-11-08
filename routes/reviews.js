const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utilities/catchAsync.js'); // is a utility function created by us to include error handling on async functions.
const ExpressError = require('../utilities/ExpressError.js') // This is a custom made error message generator which tacks on assigned message and status code in addition to default error message.
const Campground = require('../models/campground');
const Review = require('../models/review');
const User = require('../models/user');
const { campgroundSchema, reviewSchema } = require('../joi_schemas.js'); // Joi npm validates schemas and spits out more sensical error messages.
const { isLoggedIn , isReviewAuthor, validateReview } = require('../middleware'); // Deconstruct into an object when module.exports.function used in destination
const reviews = require('../controllers/reviews');




// reviews are related to a campground by pushing them onto the reviews array within campground model
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewID', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));


module.exports = router;
