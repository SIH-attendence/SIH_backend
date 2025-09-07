import mongoose from 'mongoose';
import 'dotenv/config'; // Loads environment variables from .env

const connectDB = async () => {
  try {
    // The connection logic using mongoose.connect remains the same.
    // It reads the DATABASE_URL from the loaded environment variables.
    const conn = await mongoose.connect(process.env.DATABASE_URL);

    // Log a success message to the console with the host it connected to.
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If the connection fails, log the error message and exit the process.
    // This prevents the application from running without a database connection.
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit with a failure code
  }
};

// Use 'export default' to make this function the main export of the file.
export default connectDB;

