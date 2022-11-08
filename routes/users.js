const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utilities/catchAsync.js'); // is a utility function created by us to include error handling on async functions.
const ExpressError = require('../utilities/ExpressError.js') // This is a custom made error message generator which tacks on assigned message and status code in addition to default error message.
const Campground = require('../models/campground');
const User = require('../models/user');
const { campgroundSchema, reviewSchema } = require('../joi_schemas.js'); // Joi npm validates schemas and spits out more sensical error messages.
const users = require('../controllers/users');


router.route('/register')
  .get( users.renderRegister )
  .post(catchAsync(users.register))

router.get('/login', users.renderLogin);

// passport.authenticate middleware checks hashed passwords match.
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true}), users.login);

router.get('/logout', users.logout);

module.exports = router;
