// scripts/removeUsers.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// List of emails to remove from database
const emailsToRemove = [
  'mayuri.birari23@iccs.ac.in',
  'shubham.dhule23@iccs.ac.in',
  'akanksha.nikam23@iccs.ac.in',
  'tanishka.kapse23@iccs.ac.in',
  'aishwarya.kagne23@iccs.ac.in',
  'onkar.tupe23@iccs.ac.in',
  'aditya.patil2301@iccs.ac.in',
  'komal.gade23@iccs.ac.in',
  'atharv.lokhande23@iccs.ac.in',
  'swarali.gurav23@iccs.ac.in',
  'rutvik.kumbhar23@iccs.ac.in',
  'sairaj.gade23@iccs.ac.in',
  'atharv.halnor23@iccs.ac.in',
  'ashwini.shinde23@iccs.ac.in',
  'pooja.yevale23@iccs.ac.in',
  'vishakha.shirke23@iccs.ac.in',
  'bhushan.randive23@iccs.ac.in',
  'amogh.nikam23@iccs.ac.in',
  'atharva.vyavhare23@iccs.ac.in',
  'tanmay.meshram23@iccs.ac.in',
  'anjali.lokhande23@iccs.ac.in',
  'omkar.bansude23@iccs.ac.in',
  'rohit.bhoite23@iccs.ac.in',
  'rohit.bhosale23@iccs.ac.in',
  'sakshi.sonavane23@iccs.ac.in',
  'harshada.wable23@iccs.ac.in',
  'pranoti.ghogare23@iccs.ac.in',
  'pratik.gawai23@iccs.ac.in',
  'rutik.kadam23@iccs.ac.in',
  'saniya.chinchole23@iccs.ac.in',
  'yash.ghodekar23@iccs.ac.in',
  'mrunal.shinde23@iccs.ac.in',
  'rushikesh.patil2301@iccs.ac.in',
  'prathamesh.kshirsagar23@iccs.ac.in',
  'snehal.gore23@iccs.ac.in',
  'anushka.jadhav23@iccs.ac.in',
  'vedant.mali23@iccs.ac.in',
  'tejas.rajput23@iccs.ac.in',
  'siddhi.kamble23@iccs.ac.in',
  'vishal.kolpe23@iccs.ac.in',
  'prajakta.kadam23@iccs.ac.in',
  'pranav.bansude23@iccs.ac.in',
  'omkar.darade23@iccs.ac.in',
  'pratiksha.munge23@iccs.ac.in',
  'darshan.kale23@iccs.ac.in',
  'shreyash.gore23@iccs.ac.in',
  'prathamesh.ghogare23@iccs.ac.in',
  'om.patil2312@iccs.ac.in',
  'pranav.ghogare23@iccs.ac.in',
  'ananya.pawar23@iccs.ac.in',
  'utsavi.kshirsagar23@iccs.ac.in',
  'pranjal.patil2323@iccs.ac.in',
  'rushikesh.bhujbal23@iccs.ac.in',
  'akanksha.gharat23@iccs.ac.in',
  'vedanti.jadhav23@iccs.ac.in',
  'utkarsha.hake23@iccs.ac.in',
  'atharv.chaudhari23@iccs.ac.in',
  'atharv.wavale23@iccs.ac.in',
  'shreya.sonavane23@iccs.ac.in',
  'soham.kadlag23@iccs.ac.in',
  'rohan.randive23@iccs.ac.in',
  'ankita.wagh23@iccs.ac.in',
  'raj.bhujbal23@iccs.ac.in',
  'sarthak.patil2323@iccs.ac.in',
  'omkar.bodake23@iccs.ac.in',
  'vedanti.birari23@iccs.ac.in',
  'atharva.bhise23@iccs.ac.in',
  'vedanti.bhalerao23@iccs.ac.in',
  'sayali.kshirsagar23@iccs.ac.in',
  'samruddhi.wakchaure23@iccs.ac.in',
  'sumedh.ghorpadey23@iccs.ac.in',
  'pranav.vyavhare23@iccs.ac.in',
  'jeevan.patil2323@iccs.ac.in',
  'aditi.tikone23@iccs.ac.in',
  'shivani.talekar23@iccs.ac.in',
  'tejas.ghodke23@iccs.ac.in',
  'atharv.bhoite23@iccs.ac.in',
  'siddhi.sutar23@iccs.ac.in',
  'omkar.pujari23@iccs.ac.in',
  'tanmay.gore23@iccs.ac.in',
  'anushka.patil2323@iccs.ac.in',
  'ramesh.sarode23@iccs.ac.in',
  'isha.shinde23@iccs.ac.in',
  'pranav.tandale23@iccs.ac.in',
  'shubham.kshirsagar23@iccs.ac.in',
  'rupali.halnor23@iccs.ac.in',
  'sharayu.mali23@iccs.ac.in',
  'anushka.jadhav2323@iccs.ac.in',
  'tanmay.jagtap23@iccs.ac.in',
  'komal.ghorpadey23@iccs.ac.in',
  'siddhi.jadhav23@iccs.ac.in',
  'divya.kamthe23@iccs.ac.in',
  'atharv.jadhav23@iccs.ac.in',
  'yash.koli23@iccs.ac.in',
  'mrunal.kate23@iccs.ac.in',
  'siddhi.kale23@iccs.ac.in',
  'omkar.patil2323@iccs.ac.in',
  'mansi.nikam23@iccs.ac.in',
  'pratik.patil2311@iccs.ac.in',
  'siddhant.kshirsagar23@iccs.ac.in',
  'siddhi.takalkar23@iccs.ac.in',
  'shweta.sonavane23@iccs.ac.in',
  'anushka.malwad23@iccs.ac.in',
  'rutuja.jadhav23@iccs.ac.in',
  'sharayu.gorad23@iccs.ac.in',
  'atharv.jadhav2323@iccs.ac.in',
  'atharv.khaire23@iccs.ac.in',
  'pratiksha.suryawanshi23@iccs.ac.in',
  'aditya.mhaske23@iccs.ac.in',
  'samruddhi.shinde23@iccs.ac.in',
  'ravindra.mali23@iccs.ac.in',
  'atharv.nikam23@iccs.ac.in',
  'omkar.nikam23@iccs.ac.in',
  'shubham.jadhav2323@iccs.ac.in',
  'akanksha.kulkarni23@iccs.ac.in',
  'mansi.kshirsagar23@iccs.ac.in',
  'sujal.jadhav23@iccs.ac.in',
  'jeevan.talekar23@iccs.ac.in',
  'atharva.kharat23@iccs.ac.in',
  'shubham.shinde23@iccs.ac.in',
  'yash.wagholikar23@iccs.ac.in',
  'tejas.jagtap23@iccs.ac.in',
  'vishal.jadhav23@iccs.ac.in',
  'pranav.lokhande23@iccs.ac.in',
  'prathamesh.jadhav23@iccs.ac.in',
  'aayush.more23@iccs.ac.in',
  'omkar.bhadane23@iccs.ac.in',
  'rushikesh.sonavane23@iccs.ac.in',
  'komal.khairnar23@iccs.ac.in',
  'prathamesh.gore23@iccs.ac.in',
  'pratik.patil2302@iccs.ac.in',
  'gaurav.dhule23@iccs.ac.in',
  'rohan.somwanshi23@iccs.ac.in',
  'pratiksha.karad23@iccs.ac.in',
  'atharva.patil2313@iccs.ac.in',
  'tejas.kshirsagar23@iccs.ac.in',
  'suyash.kawade23@iccs.ac.in',
  'vedant.dahibhate23@iccs.ac.in',
  'mukund.mate23@iccs.ac.in',
  'atharva.mali23@iccs.ac.in',
  'atharv.mali23@iccs.ac.in',
  'siddhesh.khairnar23@iccs.ac.in',
  'gandhar.halnor23@iccs.ac.in',
  'lucky.choudhary24@iccs.ac.in'
];

(async () => {
  if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI in your environment. Add it to .env.');
    process.exit(1);
  }

  console.log('🔗 Attempting to connect to MongoDB...');
  console.log('📍 Connection string:', process.env.MONGO_URI.replace(/\/\/.*:.*@/, '//***:***@'));

  try {
    // Add connection options for better reliability
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });
    console.log('✅ Connected to MongoDB successfully!');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:');
    console.error('Error details:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Troubleshooting steps:');
      console.log('1. Check your internet connection');
      console.log('2. Verify MongoDB Atlas cluster is running (not paused)');
      console.log('3. Check IP whitelist in MongoDB Atlas');
      console.log('4. Verify the connection string is correct');
    }
    
    process.exit(1);
  }

  let removedCount = 0;
  let notFoundCount = 0;

  console.log(`\n🗑️  Starting removal of ${emailsToRemove.length} users...\n`);

  for (const email of emailsToRemove) {
    try {
      const result = await User.deleteOne({ email: email.toLowerCase() });
      
      if (result.deletedCount > 0) {
        console.log(`✅ Removed: ${email}`);
        removedCount++;
      } else {
        console.log(`⚠️  Not found: ${email}`);
        notFoundCount++;
      }
    } catch (err) {
      console.error(`❌ Error removing ${email}: ${err.message}`);
    }
  }

  await mongoose.disconnect();
  
  console.log('\n📊 SUMMARY:');
  console.log(`✅ Successfully removed: ${removedCount} users`);
  console.log(`⚠️  Not found in database: ${notFoundCount} users`);
  console.log(`📧 Total emails processed: ${emailsToRemove.length}`);
  console.log('\n🎉 Database cleanup completed!');
})();