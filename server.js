import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from "cors";
import cron from "node-cron";
import User from "./models/User.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
// Import route files
import authRoutes from './routes/authRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import { markAbsenteesForSchool } from './controllers/attendanceController.js';
import protect from './middleware/authMiddleware.js';
import portalRoutes from './routes/portalRoutes.js';
import {
 getDashboard
} from './controllers/dashboardController.js';
import profileRoutes from './routes/ProfileRoutes.js';
// Load environment variables from .env file
dotenv.config();

// Connect to the MongoDB database
connectDB();

// Initialize the Express application
const app = express();

app.use(cors({
  origin: ["http://localhost:3000","https://student-portal-five-khaki.vercel.app","https://student-page-omega.vercel.app" , "https://sih-admin-seven.vercel.app"],
  credentials: true
}));

// Middleware to parse incoming JSON data (e.g., from the ESP8266)
app.use(express.json());

// --- Define and Use API Routes ---
// This tells the server how to direct incoming requests.
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/assignments", assignmentRoutes);

// --- Dashboard Routes ---
app.get('/api/portal/dashboard', protect, getDashboard);


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
// ⏰ Auto-mark absentees every day at 5 PM
cron.schedule("0 12 * * *", async () => {
  console.log("⏰ Running absentee auto-marking at 12 PM...");
  try {
    const schools = await User.distinct("schoolId", { role: "student" });
    for (const schoolId of schools) {
      const result = await markAbsenteesForSchool(schoolId);
      console.log(`School ${schoolId}:`, result);
    }
  } catch (error) {
    console.error("Error running absentee cron:", error);
  }
});


