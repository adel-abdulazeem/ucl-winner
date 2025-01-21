const passport = require("passport");
const validator = require("validator");
const User = require("../models/User");

// Helper function for validation errors
const handleValidationErrors = (validationErrors, req, res) => {
  req.flash("errors", validationErrors);
  return res.status(400).json({ errors: validationErrors });
};

exports.getLogin = (req, res) => {
  if (req.user) { 
    return res.redirect(`${process.env.FRONTEND_URL}/home`);
}
return res.redirect(`${process.env.FRONTEND_URL}/login`);
};

exports.postLogin = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (validator.isEmpty(req.body.password))
    validationErrors.push({ msg: "Password cannot be blank." });

  if (validationErrors.length) {
    return handleValidationErrors(validationErrors, req, res);
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("errors", info);
      return  res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "Success! You are logged in." });
      res.redirect(`${process.env.FRONTEND_URL}/home`);
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout(() => {
    console.log('User has logged out.')
  })
  req.session.destroy((err) => {
    if (err)
      console.log("Error : Failed to destroy the session during logout.", err);
    req.user = null;
    res.send('logged out successfully');
  });
};

exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect(`${process.env.FRONTEND_URL}/home`);
  }
  //    title: "Create Account",
  res.redirect(req.session.returnTo || `${process.env.FRONTEND_URL}/signup`);
};

exports.postSignup = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (!validator.isLength(req.body.password, { min: 8 }))
    validationErrors.push({
      msg: "Password must be at least 8 characters long",
    });
  if (req.body.password !== req.body.confirmPassword)
    validationErrors.push({ msg: "Passwords do not match" });

  if (validationErrors.length) {
    return handleValidationErrors(validationErrors, req, res);
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  const user = new User({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
  });

  User.findOne(
    { $or: [{ email: req.body.email }, { userName: req.body.userName }] },
    (err, existingUser) => {
      if (err) {
        return next(err);
      }
      if (existingUser) {
        req.flash("errors", {
          msg: "Account with that email address or username already exists.",
        });
        return res.redirect(`${process.env.FRONTEND_URL}/signup`);
      }
      user.save((err) => {
        if (err) {
          return next(err);
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          res.redirect(`${process.env.FRONTEND_URL}/home`);
        });
      });
    }
  );
};
