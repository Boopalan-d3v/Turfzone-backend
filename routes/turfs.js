const router = require("express").Router();
const Turf = require("../Models/Turf");

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// GET ALL CITIES
router.get("/cities", async (req, res) => {
  try {
    const cities = await Turf.distinct("city");
    res.status(200).json(cities);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cities", error: err.message });
  }
});

// GET ALL TURFS (with location and sport filtering)
router.get("/", async (req, res) => {
  try {
    const { sport, city, search, lat, lng } = req.query;
    let query = { isActive: { $ne: false } };
    
    // Filter by city
    if (city) {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }
    
    // Filter by sport
    if (sport) {
      query.sports = { $in: [sport] };
    }
    
    // Search by name or location
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    let turfs = await Turf.find(query).lean();
    
    // Add distance if user coordinates provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      turfs = turfs.map(turf => {
        if (turf.coordinates && turf.coordinates.lat && turf.coordinates.lng) {
          const distance = calculateDistance(
            userLat, userLng,
            turf.coordinates.lat, turf.coordinates.lng
          );
          return { ...turf, distance: Math.round(distance * 10) / 10 };
        }
        return { ...turf, distance: null };
      });
      
      // Sort by distance
      turfs.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }
    
    res.status(200).json(turfs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch turfs", error: err.message });
  }
});

// GET NEARBY TURFS (within radius)
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }
    
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = parseFloat(radius);
    
    let turfs = await Turf.find({ isActive: { $ne: false } }).lean();
    
    // Filter and add distance
    turfs = turfs
      .filter(turf => turf.coordinates && turf.coordinates.lat && turf.coordinates.lng)
      .map(turf => {
        const distance = calculateDistance(
          userLat, userLng,
          turf.coordinates.lat, turf.coordinates.lng
        );
        return { ...turf, distance: Math.round(distance * 10) / 10 };
      })
      .filter(turf => turf.distance <= maxRadius)
      .sort((a, b) => a.distance - b.distance);
    
    res.status(200).json(turfs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch nearby turfs", error: err.message });
  }
});

// GET SINGLE TURF BY ID
router.get("/:id", async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id);
    if (!turf) {
      return res.status(404).json({ message: "Turf not found" });
    }
    res.status(200).json(turf);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch turf", error: err.message });
  }
});

// ADD TURF (Admin only)
router.post("/", async (req, res) => {
  try {
    const { name, location, city, coordinates, pricePerHour, imageUrl, sports, amenities, rating } = req.body;
    
    if (!name || !location || !pricePerHour) {
      return res.status(400).json({ message: "Name, location, and price are required" });
    }
    
    const newTurf = new Turf({
      name,
      location,
      city: city || "Chennai",
      coordinates,
      pricePerHour,
      imageUrl,
      sports: sports || [],
      amenities: amenities || [],
      rating: rating || 4.5
    });
    
    const savedTurf = await newTurf.save();
    res.status(201).json(savedTurf);
  } catch (err) {
    res.status(500).json({ message: "Failed to create turf", error: err.message });
  }
});

// UPDATE TURF
router.put("/:id", async (req, res) => {
  try {
    const updatedTurf = await Turf.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedTurf) {
      return res.status(404).json({ message: "Turf not found" });
    }
    res.status(200).json(updatedTurf);
  } catch (err) {
    res.status(500).json({ message: "Failed to update turf", error: err.message });
  }
});

// DELETE TURF
router.delete("/:id", async (req, res) => {
  try {
    const turf = await Turf.findByIdAndDelete(req.params.id);
    if (!turf) {
      return res.status(404).json({ message: "Turf not found" });
    }
    res.status(200).json({ message: "Turf deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete turf", error: err.message });
  }
});

module.exports = router;