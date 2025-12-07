const router = require("express").Router();
const Booking = require("../Models/Booking");
const Turf = require("../Models/Turf");
const User = require("../Models/User");
const { sendBookingConfirmation } = require("../utils/emailService");

// CREATE BOOKING (with slot availability check and email confirmation)
router.post("/", async (req, res) => {
  try {
    const { user, turf, date, timeSlot, email, userName } = req.body;
    
    // Validation
    if (!user || !turf || !date || !timeSlot) {
      return res.status(400).json({ message: "All fields are required (user, turf, date, timeSlot)" });
    }
    
    // Check if slot is already booked
    const existingBooking = await Booking.findOne({
      turf,
      date,
      timeSlot,
      status: { $ne: "Cancelled" }
    });
    
    if (existingBooking) {
      return res.status(400).json({ message: "This time slot is already booked" });
    }
    
    const newBooking = new Booking({
      user,
      turf,
      date,
      timeSlot,
      status: "Confirmed"
    });
    
    const savedBooking = await newBooking.save();
    
    // Get turf details for email
    const turfDetails = await Turf.findById(turf);
    
    // Get user details or use provided email
    let userDetails;
    try {
      userDetails = await User.findById(user);
    } catch (e) {
      userDetails = null;
    }
    
    // Prepare user info for email
    const emailUser = {
      name: userName || userDetails?.name || "Guest User",
      email: email || userDetails?.email
    };
    
    // Send confirmation email if we have email address
    if (emailUser.email && turfDetails) {
      const emailResult = await sendBookingConfirmation(savedBooking, turfDetails, emailUser);
      console.log("Email result:", emailResult);
    }
    
    res.status(201).json({ 
      ...savedBooking.toObject(),
      emailSent: !!emailUser.email 
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create booking", error: err.message });
  }
});

// GET USER BOOKINGS
router.get("/:userId", async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId })
      .populate("turf")
      .sort({ date: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings", error: err.message });
  }
});

// GET BOOKED SLOTS FOR A TURF ON A SPECIFIC DATE
router.get("/slots/:turfId/:date", async (req, res) => {
  try {
    const { turfId, date } = req.params;
    
    const bookings = await Booking.find({
      turf: turfId,
      date,
      status: { $ne: "Cancelled" }
    });
    
    const bookedSlots = bookings.map(b => b.timeSlot);
    res.status(200).json({ bookedSlots });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch booked slots", error: err.message });
  }
});

// GET SINGLE BOOKING
router.get("/details/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate("turf");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch booking", error: err.message });
  }
});

// CANCEL BOOKING
router.delete("/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Check if booking date is in the future
    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({ message: "Cannot cancel past bookings" });
    }
    
    await Booking.findByIdAndDelete(req.params.bookingId);
    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel booking", error: err.message });
  }
});

// UPDATE BOOKING STATUS (Admin)
router.put("/:bookingId", async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { status },
      { new: true }
    ).populate("turf");
    
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    res.status(200).json(updatedBooking);
  } catch (err) {
    res.status(500).json({ message: "Failed to update booking", error: err.message });
  }
});

module.exports = router;