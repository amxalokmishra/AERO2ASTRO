const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require('morgan');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Pilot Schema
const pilotSchema = new mongoose.Schema({
  name: String,
  profileImage: String,
  experience: Number,
  location: String,
  coordinates: {
    latitude: Number,
    longitude: Number,
  },
});

const Pilot = mongoose.model("Pilot", pilotSchema);

// Routes
app.get("/api/pilots", async (req, res) => {
  try {
    const pilots = await Pilot.find();
    res.json(pilots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/pilots", async (req, res) => {
  try {
    const newPilot = new Pilot(req.body);
    const savedPilot = await newPilot.save();
    res.json(savedPilot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Calculate distance between two coordinates
const getDistance = (coord1, coord2) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371; // Radius of the earth in km
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Get top 10 matching pilots
app.get("/api/pilots/match", async (req, res) => {
  try {
    console.log(req.query);
    const { latitude, longitude, range } = req.query;
    const adminLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    const pilots = await Pilot.find();
    const matchingPilots = pilots
      .map((pilot) => ({
        ...pilot._doc,
        distance: getDistance(adminLocation, pilot.coordinates),
      }))
      .filter((pilot) => pilot.distance <= range)
      .sort((a, b) => b.experience - a.experience)
      .slice(0, 10);

    console.log(pilots);

    res.json(matchingPilots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 1231;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
