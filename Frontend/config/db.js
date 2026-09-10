const mongoose = require('mongoose');

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('CRITICAL MONGOOSE ERROR:', error);
});

async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('Missing MONGO_URI in .env');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    console.log('MongoDB Atlas Connected Successfully!');
  } catch (error) {
    console.error('[DATABASE] MongoDB unavailable:', error.message);
    console.error('[DATABASE] Update MONGO_URI and confirm Atlas network access before using database-backed features.');
  }
}

module.exports = connectDB;
