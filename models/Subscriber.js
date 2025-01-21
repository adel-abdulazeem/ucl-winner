const mongoose = require("mongoose");

const SubscriberSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },

  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
      type: Date, 
      required: true 
    },
    totalDays: {
      type: Number, 
      default: 0,
    },
  amount: { 
      type: Number,
       required: true 
    },
  image: {
    type: String,
  },
  cloudinaryId: {
    type: String,
    require: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


SubscriberSchema.pre("save", function () {

  // Calculate the number of days for the current subscription period
  if (this.startDate && this.endDate) {
    const timeDiff = this.endDate - this.startDate; // Difference in milliseconds
    const currentDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert to days

    // Accumulate totalDays
    if (this.isNew) {
      // For new subscriptions, set totalDays to currentDays
      this.totalDays = currentDays;
    } else {
      // For renewals, add currentDays to totalDays
      this.totalDays += currentDays;
    }
  }

});

module.exports = mongoose.model("Subscriber", SubscriberSchema);
