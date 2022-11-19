if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require('express');
const path = require('path'); // Dont need this. I think using concatenation is easier.
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); // Allows for boilerplate creation
const methodOverride = require('method-override'); // npm which allows form to send put or delete requests instead of post
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan'); // middleware that console.logs route stats.
const ExpressError = require('./utilities/ExpressError.js') // This is a custom made error message generator which tacks on assigned message and status code in addition to default error message.
const passport = require('passport');
const LocalStrategy = require('passport-local');

const User = require('./models/user');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');   // mongoSanitize stops mongo injection in query strings by users.

// MRC
// Bad way to connect to db. Need async connection and make app.listen run after db connection.
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
    // could have done useFindAndModify: false, here instead of the set below
});

// Error handling for mongoose connection.
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
    app.listen(3000, () => {
        console.log('Serving on port 3000')
    })

});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);

app.use(express.urlencoded({ extended: true })); // This allows post requests to send form information. Like objects that can be parsed.
app.use(methodOverride('_method')); // needed to send delete or put requests from forms
app.use(morgan('tiny')); // Good little middleware which console.logs what route was requested and time. Good for dev, debugging.
app.use(express.static(__dirname + '/public'));
app.use(mongoSanitize());  // mongoSanitize stops mongo injection in query strings by users.

const sessionConfig = {
  name: 'session',   // The default name is tergeted by hacker code sometimes
  secret: "companysecret", //This cant be leaked. Used to check cookies returned from clients have not been altered.
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,           // localhost is not a secure connection but in production we would want cookies to only be accessible over https
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // fuckwits in milliseconds
    maxAge: 1000 * 60 * 60 * 24 * 7,
  }
  // store: will be something like redis. for short term memory. Default is javascript memory which isnt scalable.
}
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet({ contentSecurityPolicy: false }));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",

];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/ds4opo9zq/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// .locals allows data to be passed into ejs views
// when a route handler sets req.flash with the name success or error, the message will be passed into the ejs file.
// our flash passed via partial which is fed into boilerplate.
app.use((req, res, next)=>{
  console.log(req.query);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

// Links the router to routes files. note inside '' is the start of the URL. This must be exclude from the .get .post etc in the route file.
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);



app.get('/', (req, res) => {
    res.render('home');
});


// receives all routes and creates and error and passes it to Error Handler. Note if next(filled-in) auto passes to error handler.
app.all('*', (res, req , next) => {
  next(new ExpressError("Page Not Found", 404));
})

// Error handler middleware (must have fourth parameter)
// Will take any error and pass the error data (named err) to error.ejs view.
// const extracts statusCode and assigns a default however does not modify err. if() sets default message and modifies the err data.
app.use((err, req, res, next)=>{
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something Went Wrong!"
  res.status(statusCode).render('error.ejs', { err });
})

// Server activation moved to db connection so than only occurs once db connected. Could use an event emitter also.
// app.listen(3000, () => {
//     console.log('Serving on port 3000')
// })
