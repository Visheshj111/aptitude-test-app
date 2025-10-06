// scripts/bulkAddUsers.js
require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');

const usersToAdd = [
  // Add new email entries here
  // Example: { email: 'student@iccs.ac.in' },
];

function generatePassword() {
  return crypto.randomBytes(8).toString('hex'); // 16-char random string
}

(async () => {
  if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI in your environment. Add it to .env.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const credentials = [];

  for (const entry of usersToAdd) {
    const email = entry.email.trim().toLowerCase();
    const username =
      entry.username ??
      email.split('@')[0].replace(/[^a-z0-9]/gi, '_').slice(0, 20);

    const password = generatePassword();

    try {
      const user = new User({ username, email, password });
      await user.save();
      credentials.push({ email, username: user.username, password });
      console.log(`✅ Added ${email}`);
    } catch (err) {
      console.error(`⚠️  Skipped ${email}: ${err.message}`);
    }
  }

  await mongoose.disconnect();
  console.log('All done! Here are the plain-text credentials:');
  console.table(credentials);
})();