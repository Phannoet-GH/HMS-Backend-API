const mongoose = require('mongoose');

module.exports = async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not configured');
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
};
