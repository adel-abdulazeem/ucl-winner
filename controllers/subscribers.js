const cloudinary = require("../middleware/cloudinary");
const Subscriber = require("../models/Subscriber");
const mongoose = require('mongoose')

module.exports = {
  getUser: async (req, res) => {
    try {
      res.status(200).json({ username: req.user?.username});
    } catch (err) {
      console.log(err);
    }
  },
  getSubscriber: async (req, res) => {
    try {
      const subscriberId = req.params.id;
      // Validate the ID
      if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
        return res.status(400).json({ error: "Invalid subscriber ID" });
      }
      const subscriber = await Subscriber.findById(subscriberId).lean();
  
      if (!subscriber) {
        return res.status(404).json({ error: "Subscriber not found" });
      }
      res.status(200).json(subscriber);
    }catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const subscribers = await Subscriber.find().sort({ createdAt: "desc" }).lean();
      res.json(subscribers);
    } catch (err) {
      console.log(err);
    }
  },
  createSub: async (req, res) => {
    try {
      let imageUrl = null;
      let cloudinaryId = null;
  
      // Upload image to Cloudinary only if a file is provided
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        imageUrl = result.secure_url;
        cloudinaryId = result.public_id;
      }

      await Subscriber.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        amount: req.body.amount,
        image: imageUrl,
        cloudinaryId: cloudinaryId,
        user: req.user,
      });
      console.log("Subscriper has been added!");
      res.send("File uploaded successfully");
        } catch (err) {
      console.log(err);
    }
  },
  updateSubscriper: async (req, res) => {
    const subscriberId = req.params.id;
    const { firstName, lastName, phone, startDate, endDate, amount } = req.body;
    const image = req.file ? req.file.path : null;
    try {
      const subscriber = await Subscriber.findById(subscriberId);
      if (!subscriber) {
        return res.status(404).json({ error: 'Subscriber not found' });
      }
  
      const updateData = {
        firstName,
        lastName,
        phone,
        startDate,
        endDate,
        amount,
      };
  
      // If a new image is uploaded
      if (image) {
        const result = await cloudinary.uploader.upload(image, {
          folder: 'subscribers', // Optional: Organize images in a folder
        });
  
        // Delete the old image from Cloudinary if it exists
        if (subscriber.cloudinaryId) {
          await cloudinary.uploader.destroy(subscriber.cloudinaryId);
        }

        // Update the image URL and Cloudinary ID
        updateData.image = result.secure_url;
        updateData.cloudinaryId = result.public_id;
      } else {
        // If no new image is uploaded, keep the existing image and Cloudinary ID
        updateData.image = subscriber.image;
        updateData.cloudinaryId = subscriber.cloudinaryId;
      }
        const updatedSubscriber = await Subscriber.findByIdAndUpdate(
        subscriberId,
        updateData,
        { new: true, upsert: false } 
      );
      res.status(200).json(updatedSubscriber);
    } catch (error) {
      console.error('Error updating subscriber:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  deleteSubscriber: async (req, res) => {
    try {
      const subscriber = await Subscriber.findById({ _id: req.params.id });
      if(subscriber.cloudinaryId){
        await cloudinary.uploader.destroy(subscriber.cloudinaryId);
      }
      // Delete subscriber from db
      await Subscriber.deleteOne({ _id: req.params.id });
      console.log("Deleted Subscriper");
      res.status(200).json();
    } catch (err) {
      console.log(err);
    }
  },
};









