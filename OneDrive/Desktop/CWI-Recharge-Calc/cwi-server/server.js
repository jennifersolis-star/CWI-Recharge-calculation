// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables (secrets) from a .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware 
app.use(cors()); 
app.use(express.json()); 

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI; 

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Database Schema (Data Structure) ---
const rechargeSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  acreage: Number,
  soilType: String,
  totalCostEstimate: Number,
  annualNetBenefit: Number,
  roi: Number,
});

const RechargeResult = mongoose.model('RechargeResult', rechargeSchema);


// --- API Routes (Endpoints) ---

// 1. Simple Test Route
app.get('/', (req, res) => {
  res.send('Water Recharge Calculator Backend is running!');
});

// 2. Route to SAVE a new calculation result
app.post('/api/results', async (req, res) => {
  try {
    const newResult = new RechargeResult(req.body);
    await newResult.save();
    res.status(201).send({ message: 'Result saved successfully!', result: newResult });
  } catch (error) {
    res.status(400).send({ message: 'Failed to save result.', error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});