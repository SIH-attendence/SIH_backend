const mongoose = require('mongoose');

// This line ensures that our application has access to the variables in the .env file.
require('dotenv').config();

const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB Atlas cluster using the secret URL.
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Successfully connected to MongoDB Atlas!');
  } catch (err) {
    // If the connection fails for any reason (e.g., wrong password, network issue),
    // we log a fatal error and exit the application.
    console.error('FATAL ERROR: Could not connect to MongoDB Atlas.');
    console.error(err.message); // Print the specific error message
    process.exit(1); // Exit the application with a "failure" code
  }
};

module.exports = connectDB;
