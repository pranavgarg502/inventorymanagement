const dotenv = require('dotenv');
const connectDB = require('../backend/db');
const app = require('../backend/app');

dotenv.config();

let dbReady = false;

const handler = async (req, res) => {
  if (!dbReady) {
    await connectDB();
    dbReady = true;
  }

  return app(req, res);
};

module.exports = handler;
