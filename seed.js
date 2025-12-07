const mongoose = require("mongoose");
require("dotenv").config();

const Turf = require("./Models/Turf");

const sampleTurfs = [
  // Chennai Turfs
  {
    name: "Green Field Sports Arena",
    location: "Anna Nagar, Chennai",
    city: "Chennai",
    coordinates: { lat: 13.0850, lng: 80.2101 },
    pricePerHour: 1500,
    imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800",
    sports: ["Football", "Cricket"],
    rating: 4.8,
    totalReviews: 124,
    amenities: ["Parking", "Floodlights", "Washroom", "Drinking Water"]
  },
  {
    name: "Prime Turf Chennai",
    location: "T Nagar, Chennai",
    city: "Chennai",
    coordinates: { lat: 13.0418, lng: 80.2341 },
    pricePerHour: 1800,
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    sports: ["Football"],
    rating: 4.6,
    totalReviews: 89,
    amenities: ["Parking", "Floodlights", "Changing Room", "Cafeteria"]
  },
  {
    name: "Sports Hub OMR",
    location: "OMR, Chennai",
    city: "Chennai",
    coordinates: { lat: 12.9165, lng: 80.2275 },
    pricePerHour: 1200,
    imageUrl: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800",
    sports: ["Cricket", "Football", "Tennis"],
    rating: 4.5,
    totalReviews: 156,
    amenities: ["Parking", "Floodlights", "Washroom"]
  },
  {
    name: "Kick Arena Velachery",
    location: "Velachery, Chennai",
    city: "Chennai",
    coordinates: { lat: 12.9788, lng: 80.2203 },
    pricePerHour: 1400,
    imageUrl: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800",
    sports: ["Football"],
    rating: 4.7,
    totalReviews: 203,
    amenities: ["Parking", "Floodlights", "Washroom", "First Aid"]
  },
  {
    name: "Chennai Cricket Ground",
    location: "Adyar, Chennai",
    city: "Chennai",
    coordinates: { lat: 13.0012, lng: 80.2565 },
    pricePerHour: 2000,
    imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
    sports: ["Cricket"],
    rating: 4.9,
    totalReviews: 312,
    amenities: ["Parking", "Floodlights", "Changing Room", "Washroom", "Cafeteria"]
  },
  // Bangalore Turfs
  {
    name: "Koramangala Sports Complex",
    location: "Koramangala, Bangalore",
    city: "Bangalore",
    coordinates: { lat: 12.9352, lng: 77.6245 },
    pricePerHour: 1600,
    imageUrl: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800",
    sports: ["Football", "Cricket"],
    rating: 4.7,
    totalReviews: 178,
    amenities: ["Parking", "Floodlights", "Changing Room", "Cafeteria"]
  },
  {
    name: "HSR Football Arena",
    location: "HSR Layout, Bangalore",
    city: "Bangalore",
    coordinates: { lat: 12.9116, lng: 77.6389 },
    pricePerHour: 1400,
    imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800",
    sports: ["Football"],
    rating: 4.5,
    totalReviews: 145,
    amenities: ["Parking", "Floodlights", "Washroom"]
  },
  {
    name: "Indiranagar Sports Hub",
    location: "Indiranagar, Bangalore",
    city: "Bangalore",
    coordinates: { lat: 12.9784, lng: 77.6408 },
    pricePerHour: 2200,
    imageUrl: "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800",
    sports: ["Football", "Cricket", "Tennis", "Badminton"],
    rating: 4.8,
    totalReviews: 267,
    amenities: ["Parking", "Floodlights", "Changing Room", "Washroom", "Cafeteria", "Pro Shop"]
  },
  // Mumbai Turfs
  {
    name: "Andheri Sports Zone",
    location: "Andheri West, Mumbai",
    city: "Mumbai",
    coordinates: { lat: 19.1364, lng: 72.8296 },
    pricePerHour: 2500,
    imageUrl: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=800",
    sports: ["Football", "Cricket"],
    rating: 4.6,
    totalReviews: 189,
    amenities: ["Parking", "Floodlights", "Changing Room", "Cafeteria"]
  },
  {
    name: "PowerPlay Turf Bandra",
    location: "Bandra, Mumbai",
    city: "Mumbai",
    coordinates: { lat: 19.0596, lng: 72.8295 },
    pricePerHour: 3000,
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800",
    sports: ["Football", "Cricket"],
    rating: 4.9,
    totalReviews: 342,
    amenities: ["Valet Parking", "Floodlights", "Premium Changing Room", "Restaurant", "Lounge"]
  },
  // Hyderabad Turfs
  {
    name: "Gachibowli Sports Arena",
    location: "Gachibowli, Hyderabad",
    city: "Hyderabad",
    coordinates: { lat: 17.4401, lng: 78.3489 },
    pricePerHour: 1300,
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
    sports: ["Football", "Cricket", "Tennis"],
    rating: 4.5,
    totalReviews: 156,
    amenities: ["Parking", "Floodlights", "Washroom", "Drinking Water"]
  },
  {
    name: "HITEC City Turf",
    location: "HITEC City, Hyderabad",
    city: "Hyderabad",
    coordinates: { lat: 17.4485, lng: 78.3908 },
    pricePerHour: 1800,
    imageUrl: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800",
    sports: ["Football", "Badminton"],
    rating: 4.7,
    totalReviews: 198,
    amenities: ["Parking", "Floodlights", "Changing Room", "Cafeteria"]
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing turfs
    await Turf.deleteMany({});
    console.log("Cleared existing turfs");

    // Insert sample turfs
    const result = await Turf.insertMany(sampleTurfs);
    console.log(`Inserted ${result.length} turfs`);

    console.log("\nSample turfs seeded successfully!");
    console.log("Cities available:", [...new Set(sampleTurfs.map(t => t.city))]);
    
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seedDatabase();
