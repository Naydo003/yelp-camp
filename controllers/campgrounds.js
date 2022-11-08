
const Campground = require('../models/campground');
const { isLoggedIn , isAuthor, validateCampground } = require('../middleware'); // Deconstruct into an object when module.exports.function used in destination
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });


module.exports.index = async (req, res) => {    // catchAsync is a utility function created by us to include error handling on async functions. It does the same as try-catch below just quicker for a website with many routes.
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}


module.exports.createCampground = async (req, res, next) => {
  try {

    const campground = new Campground(req.body.campground); // req.body will be undefined if not parsed. Need app.use(express.urlencoded({ extended: true }));
    const geoData = await geocoder.forwardGeocode({       // This code use mapbox npm/api to return large object full of data.
      query: req.body.campground.location,
      limit: 1
    }).send();
    campground.geometry = geoData.body.features[0].geometry;     //  This is actually GeoJSON. Coordinates are inside of this. see campground model for structure.
    // multer gets files from fileupload in form. unfortunately it passes it back in req.files not req.body.
    campground.images = req.files.map(f => ({       // the multiple (see new.ejs) files uploader returns an array. maps instance f to a new object-array and extracts filename and path.
      filename: f.filename,
      url: f.path
    }));
    campground.author = req.user._id; // this makes the loggenin user the author of the campsite.
    await campground.save();
    req.flash('success', "You successfully saved a new campground");
    res.redirect(`/campgrounds/${campground._id}`)
  } catch (e){
    next(e);            // The try - catch catches any error and passes it to the next middleware which is our error handler at the bottom. This is done using catchAsync function in all other routes. This is just to demo.
  }
}




module.exports.showCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({  // populate allows us to access the review collection from nested withing the campground object. Otherwise we would just have the review id.
      path: 'reviews',
      populate: { path: 'author' }   // This nested populate allows us to populate author inside review model.
    }).populate('author');         // This one populates author in campground model.
    if (!campground) {
      req.flash('error', "Cannot find that campground");
      return res.redirect('/campgrounds');
    }                                          // custom error handling for a common error.
    res.render('campgrounds/show', { campground });
}




module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash('error', "Cannot find that campground");
      return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}


module.exports.updateCampground = async (req, res) => {
    const { id } = req.params; // This destructures the req.params object.
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); // Could have just used req.params.id    // $set: is being applied by mongoose. Without $set other fields would be nullified { $set: { name: 'jason bourne' }}
    const imgs = req.files.map(f => ({ filename: f.filename, url: f.path }));
    campground.images.push(...imgs);     // pushes the new images onto the end on the images array. Note new images are already in an array so need to spread them first using ...
    await campground.save();
    if (req.body.deleteImages) {                      // an array was created in campground model to hold what images are to deleted.
      for (let filename of req.body.deleteImages) {    // could be more than 1 in array
        await cloudinary.uploader.destroy(filename);    // This has it deleted from cloudinary storage
      }
      await campground.updateOne({$pull: { images: { filename: { $in: req.body.deleteImages}}}}) // This pulls any image where filename is inside delete images array.
    }                                                                                           // seems to work without clearing deleteImages
    req.flash('success', "You successfully updated a campground");
    res.redirect(`/campgrounds/${campground._id}`)
}



module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id); // Note... all assosciated reviews are deleted using postware in campground model.
    req.flash('success', "You successfully deleted a campground");
    res.redirect('/campgrounds');
}
