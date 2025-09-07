require('dotenv').config(); // Loads environment variables from a .env file into process.env
const express = require('express');
const connectDB = require('./config/db');

// --- Initialize Server and Database Connection ---
const app = express();
connectDB(); // Establish connection to the MongoDB database

// --- Middleware ---
// This allows our server to accept and parse JSON data in the body of requests.
// It's essential for receiving data from both the ESP8266 and the web portals.
app.use(express.json());

// --- Define and Use API Routes ---
// Any request starting with /api/auth will be handled by authRoutes.js
app.use('/api/auth', require('./routes/authRoutes'));
// Any request starting with /api/attendance will be handled by attendanceRoutes.js
app.use('/api/attendance', require('./routes/attendanceRoutes'));
// Any request starting with /api/portal will be handled by portalRoutes.js
app.use('/api/portal', require('./routes/portalRoutes'));

// --- Basic Welcome Route ---
// This helps us verify that the server is running when we visit the root URL.
app.get('/', (req, res) => {
  res.send('School Ecosystem API is online and running.');
});

// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

