module.exports = {
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash("error_msg", "Please log in to access this page"); // Flash message
      res.redirect("http://localhost:5173/login");
    }
  }
};
