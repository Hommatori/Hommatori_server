// Import the dotenv library for loading environment variables from a .env file
const dotenv = require('dotenv');

// Load the environment variables from a .env file
dotenv.config();

// Import the Pool object from the pg library for connecting to a PostgreSQL database
const { Pool } = require ('pg');

// Create a new Pool object for connecting to the PostgreSQL database with the environment variables from the .env file
const pool = new Pool({
  host: process.env.PG_HOST, // Use the host environment variable for the database host
  port: process.env.PG_PORT, // Use the port environment variable for the database port
  user: process.env.PG_USER, // Use the user environment variable for the database user
  password: process.env.PG_PASSWORD, // Use the password environment variable for the database password
  database: process.env.PG_DATABASE, // Use the database environment variable for the database name
  ssl: { rejectUnauthorized: false }, // Disable SSL verification for development purposes only
  max: 5, // Set the maximum number of clients in the pool to 5
  statement_timeout: 10000, // Set the statement timeout for queries to 10 seconds
});

// Export the pool object to be used in other modules
module.exports = pool;