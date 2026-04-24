const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Signup Route
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists! Try logging in." });
    }
    
    const newUser = new User({ name, email, password });
    await newUser.save();
    
    console.log('New user registered:', email);
    res.status(201).json({ 
      success: true, 
      user: { name: newUser.name, email: newUser.email } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Signup failed. Server error." });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found! Register first." });
    }
    
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: "Incorrect password!" });
    }
    
    console.log('User logged in:', email);
    res.status(200).json({ 
      success: true, 
      user: { name: user.name, email: user.email } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Login failed. Server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
