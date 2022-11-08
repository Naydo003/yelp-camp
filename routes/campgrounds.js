const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utilities/catchAsync.js'); // is a utility function created by us to include error handling on async functions.
const ExpressError = require('../utilities/ExpressError.js') // This is a custom made error message generator which tacks on assigned message and status code in addition to default error message.
const Campground = require('../models/campground');
const { campgroundSchema, reviewSchema } = require('../joi_schemas.js'); // Joi npm validates schemas and spits out more sensical error messages.
const { isLoggedIn , isAuthor , validateCampground , logMiddleware } = require('../middleware'); // Deconstruct into an object when module.exports.function used in destination
const campgrounds = require('../controllers/campgrounds');
const multer  = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


// Middleware creation
// just a function with a third parameter
// This should be in middleware file but can also be done in route handler like this. Will only run on routes in this file. Called for by callback in route.





router.get('/', catchAsync(campgrounds.index));

// isLoggedIn is in generic middleware file. It checks that users are logged in before serving up the view. If not they are redirected with a flash message.
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// This post request from new.ejs receives an object embedded in object called campground with title and location. Usually it recieves title and location as separate objects.
// Middleware called for as callback in app.post('url', callback), can have multiple.
router.post('/', isLoggedIn, upload.array('campground[images]'), validateCampground, catchAsync(campgrounds.createCampground));
// upload.array must be called before anything uses campground data. This is because a form with fileupload requires multer, including for req.body. Files in req.files


// make sure a params get is after all pre-determined url routes. eg if .get /campgrounds/new came after this /new would be picked up here and treated as parameter.
router.get('/:id', catchAsync(campgrounds.showCampground));
// populating all reviews and all authors like this is memory intensive. Better to just save username in review. Also as app grows will need infinite scroll (paginate it)

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;
