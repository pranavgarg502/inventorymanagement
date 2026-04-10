const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection.asPromise();
  }

  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  const connection = await mongoose.connect(MONGO_URI);
  isConnected = true;
  return connection;
};

module.exports = connectDB;
