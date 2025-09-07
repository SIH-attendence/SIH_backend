import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import route files
import authRoutes from './routes/authRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import portalRoutes from './routes/portalRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Connect to the MongoDB database
connectDB();

// Initialize the Express application
const app = express();

// Middleware to parse incoming JSON data (e.g., from the ESP8266)
app.use(express.json());

// --- Define and Use API Routes ---
// This tells the server how to direct incoming requests.
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/portal', portalRoutes);

// A simple welcome route for the root URL
app.get('/', (req, res) => {
  res.send('School Ecosystem API is running...');
});

// Define the port the server will run on
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

