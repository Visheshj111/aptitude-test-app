// scripts/testConnection.js
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI in your environment. Add it to .env.');
    process.exit(1);
  }

  console.log('🔗 Testing MongoDB connection...');
  console.log('📍 Using connection string:', process.env.MONGO_URI.replace(/\/\/.*:.*@/, '//***:***@'));

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // 15 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test if we can access the users collection
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Go to MongoDB Atlas and check if your cluster is paused');
      console.log('3. In MongoDB Atlas, go to Network Access and add your IP (0.0.0.0/0 for testing)');
      console.log('4. Verify your username/password in the connection string');
    }
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
})();