const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');

dotenv.config(); // ✅ Load environment variables

const app = express(); // ✅ Initialize Express app

// Middleware
app.use(cors()); // ✅ Enable CORS for all origins

  app.use(express.json()); // ✅ Parse incoming JSON
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // ✅ Serve uploaded files if needed
app.use("/api/chart", require("./routes/chartRoutes"));

// API Routes
app.use('/api/auth', authRoutes); // ✅ Auth routes
app.use('/api/upload', uploadRoutes);   // ✅ Upload routes

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });
