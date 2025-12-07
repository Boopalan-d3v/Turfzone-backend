const mongoose = require("mongoose");

const TurfSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  city: { type: String, required: true, default: "Chennai" },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  pricePerHour: { type: Number, required: true },
  imageUrl: { type: String },
  sports: [String],
  rating: { type: Number, default: 4.5, min: 1, max: 5 },
  totalReviews: { type: Number, default: 0 },
  amenities: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Index for location-based queries
TurfSchema.index({ city: 1 });
TurfSchema.index({ "coordinates.lat": 1, "coordinates.lng": 1 });

module.exports = mongoose.model("Turf", TurfSchema);