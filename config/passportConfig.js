const passport = require("passport");
const User = require("../models/User"); // Adjust the path to your User model

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id); // Store user ID in session
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Retrieve user from database
    done(null, user); // Populate req.user
  } catch (err) {
    done(err);
  }
});

// Export the configured passport instance
module.exports = passport;