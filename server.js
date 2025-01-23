const express = require("express");
const cors = require("cors")
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("express-flash");
const logger = require("morgan");
const connectDB = require("./config/database");
const cron = require("node-cron");
const { checkSubscriptions } = require("./config/twilioService");


const mainRoutes = require("./routes/main");
const subscriberRoutes = require("./routes/subscribers");
//Use .env file in config folder
require("dotenv").config({ path: "./config/.env" });

// Passport config
require("./config/passport")(passport);

//Connect To Database
connectDB();

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5173/login', 'http://localhost:5173/home']; 

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions))
// Enable CORS for all routes
// app.use(cors({
//   origin: "http://localhost:5173", // Allow requests from this origin
//   methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
//   credentials: true, // Allow cookies and credentials
// }));

//Static Folder
app.use(express.static("public"));

//Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Logging
app.use(logger("dev"));


// Setup Sessions - stored in MongoDB
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Use flash messages for errors, info, ect...
app.use(flash());

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes);
app.use("/post", subscriberRoutes);

app.get("/test-session", (req, res) => {
  if (!req.session.views) {
    req.session.views = 0;
  }
  req.session.views++;
  res.send(`Session views: ${req.session.views}`);
});

// Run every day at 8 AM
cron.schedule("22 15 * * *", async () => {
  console.log("Checking subscriptions...");
  try {
    await checkSubscriptions();
  } catch (error) {
    console.error("Error in scheduled task:", error);
  }
});

// Function to check server health
const checkServerHealth = async () => {
  try {
    const response = await fetch(`https://ucl-winner.onrender.com`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Server health check successful:", data);
  } catch (error) {
    console.error("Server health check failed:", error.message);
  }
};

// Schedule health check every 5 minutes
cron.schedule("*/5 * * * *", () => {
  console.log("Running health check...");
  checkServerHealth();
});
//Server Running
app.listen(process.env.PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} on port: ${process.env.PORT}`);
});
 