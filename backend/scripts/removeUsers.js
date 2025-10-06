// scripts/removeUsers.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Configuration - Choose removal method
const REMOVAL_MODE = {
  ALL: 'all',           // Remove all users
  BY_EMAIL: 'by_email', // Remove specific users by email
  BY_DOMAIN: 'by_domain' // Remove users by email domain
};

// Set your preferred removal mode here
const MODE = REMOVAL_MODE.ALL; // Change this as needed

// For BY_EMAIL mode: specify emails to remove
const emailsToRemove = [
  // Add specific emails here
  // 'student1@iccs.ac.in',
  // 'student2@iimp.edu.in',
];

// For BY_DOMAIN mode: specify domains to remove
const domainsToRemove = [
  '@iccs.ac.in',
  '@iimp.edu.in'
];

async function removeAllUsers() {
  console.log('🗑️  Removing ALL users from the database...');
  const result = await User.deleteMany({});
  console.log(`✅ Removed ${result.deletedCount} users`);
  return result.deletedCount;
}

async function removeUsersByEmail(emails) {
  console.log('🗑️  Removing users by specific emails...');
  const result = await User.deleteMany({ 
    email: { $in: emails.map(email => email.toLowerCase()) } 
  });
  console.log(`✅ Removed ${result.deletedCount} users`);
  return result.deletedCount;
}

async function removeUsersByDomain(domains) {
  console.log('🗑️  Removing users by email domains...');
  
  // Create regex patterns for each domain
  const domainRegexes = domains.map(domain => new RegExp(domain.replace('@', '@') + '$', 'i'));
  
  const result = await User.deleteMany({ 
    email: { $in: domainRegexes }
  });
  console.log(`✅ Removed ${result.deletedCount} users`);
  return result.deletedCount;
}

async function listUsers() {
  console.log('📋 Current users in database:');
  const users = await User.find({}, 'username email createdAt').sort({ createdAt: -1 });
  
  if (users.length === 0) {
    console.log('   No users found in database');
    return;
  }
  
  console.table(users.map(user => ({
    Username: user.username,
    Email: user.email,
    Created: user.createdAt ? user.createdAt.toLocaleDateString() : 'Unknown'
  })));
}

(async () => {
  try {
    // Check for MongoDB connection
    if (!process.env.MONGO_URI) {
      console.error('❌ Missing MONGO_URI in your environment. Add it to .env.');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    // Show current users before removal
    await listUsers();
    
    // Confirmation prompt
    console.log('\\n⚠️  WARNING: This will permanently delete users from the database!');
    console.log(`Mode: ${MODE}`);
    
    if (MODE === REMOVAL_MODE.BY_EMAIL) {
      console.log(`Emails to remove: ${emailsToRemove.join(', ')}`);
    } else if (MODE === REMOVAL_MODE.BY_DOMAIN) {
      console.log(`Domains to remove: ${domainsToRemove.join(', ')}`);
    }
    
    console.log('\\nPress Ctrl+C to cancel, or wait 5 seconds to proceed...');
    
    // 5-second delay for user to cancel
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    let removedCount = 0;
    
    // Execute removal based on mode
    switch (MODE) {
      case REMOVAL_MODE.ALL:
        removedCount = await removeAllUsers();
        break;
        
      case REMOVAL_MODE.BY_EMAIL:
        if (emailsToRemove.length === 0) {
          console.log('❌ No emails specified for removal. Please add emails to the emailsToRemove array.');
          break;
        }
        removedCount = await removeUsersByEmail(emailsToRemove);
        break;
        
      case REMOVAL_MODE.BY_DOMAIN:
        removedCount = await removeUsersByDomain(domainsToRemove);
        break;
        
      default:
        console.log('❌ Invalid removal mode specified');
        break;
    }
    
    console.log('\\n📋 Users remaining in database:');
    await listUsers();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\\n🔌 Disconnected from MongoDB');
  }
})();

// Export functions for potential reuse
module.exports = {
  removeAllUsers,
  removeUsersByEmail,
  removeUsersByDomain,
  listUsers
};