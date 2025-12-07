const router = require("express").Router();
const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });
    
    const savedUser = await newUser.save();
    
    // Generate JWT
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = savedUser.toObject();
    res.status(201).json({ ...userWithoutPassword, token });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    
    // Check if user signed up with Google (no password)
    if (!user.password) {
      return res.status(400).json({ message: "Please sign in with Google" });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    
    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(200).json({ ...userWithoutPassword, token });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// GOOGLE SIGN-IN
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    
    console.log("Received Google auth request");
    
    if (!credential) {
      console.log("No credential provided");
      return res.status(400).json({ message: "Google credential is required" });
    }

    console.log(`Credential length: ${credential.length}`);
    console.log(`Expected Audience (Client ID): ${process.env.GOOGLE_CLIENT_ID}`);

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    console.log("Google payload verified:", payload.email);
    
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      console.log("User exists, updating...");
      // Update Google ID and picture if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.picture = picture;
        await user.save();
      }
    } else {
      console.log("Creating new user...");
      // Create new user
      user = new User({
        name,
        email,
        googleId,
        picture,
        // No password for Google users
      });
      await user.save();
    }
    
    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;
    
    res.status(200).json({ ...userObject, token });
  } catch (err) {
    console.error("Google auth error details:", err);
    res.status(500).json({ 
      message: "Google authentication failed: " + err.message, 
      error: err.message 
    });
  }
});

// GET USER PROFILE
router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
});

module.exports = router;