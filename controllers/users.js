
const User = require('../models/user');


module.exports.renderRegister = (req, res) => {
res.render('users/register');
}


module.exports.register = async (req, res)=>{
  try {
      const { email, username, password } = req.body;
      const user = new User({email, username}); // NEVER!! store the password in database
      const registeredUser = await User.register(user, password); // password npm hashes the password for us and saves it in user database model
      req.login(registeredUser, err => {      // This logs in someone straight after they reqister.
        if (err) {return next(err);}
        req.flash('success','Welcome to Yelp Camp!');
        res.redirect('/campgrounds');
      })
  } catch (e) {
      req.flash('error', e.message);
      res.redirect('/register');
  }
}

module.exports.renderLogin = (req, res)=>{
  res.render('users/login');
}

module.exports.login = (req, res)=>{
  req.flash('success', "Welcome Back");
  const redirectUrl = req.session.returnTo || '/campgrounds'; //returns client to previous page if one exists in session or || /campground as default
  delete req.session.returnTo;
  if (redirectUrl.includes("_method")){
    res.redirect(307, redirectUrl);
  }
  res.redirect(redirectUrl);
}

module.exports.logout = function(req, res, next){
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success', "logout successful");
    res.redirect('/campgrounds');
  });
}
