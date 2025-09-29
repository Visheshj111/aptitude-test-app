// scripts/bulkAddUsers.js
require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');

const usersToAdd = [
  { email: 'mayuri.birari23@iccs.ac.in' },
{ email: 'Shubham.Dhule23@iccs.ac.in' },
{ email: 'akanksha.nikam23@iccs.ac.in' },
{ email: 'Tanishka.Kapse23@iccs.ac.in' },
{ email: 'aishwarya.kagne23@iccs.ac.in' },
{ email: 'onkar.tupe23@iccs.ac.in' },
{ email: 'aditya.patil2301@iccs.ac.in' },
{ email: 'komal.gade23@iccs.ac.in' },
{ email: 'atharv.lokhande23@iccs.ac.in' },
{ email: 'swarali.gurav23@iccs.ac.in' },
{ email: 'rutvik.kumbhar23@iccs.ac.in' },
{ email: 'sairaj.gade23@iccs.ac.in' },
{ email: 'atharv.halnor23@iccs.ac.in' },
{ email: 'ashwini.shinde23@iccs.ac.in' },
{ email: 'pooja.yevale23@iccs.ac.in' },
{ email: 'vishakha.shirke23@iccs.ac.in' },
{ email: 'Bhushan.Randive23@iccs.ac.in' },
{ email: 'Amogh.Nikam23@iccs.ac.in' },
{ email: 'Atharva.Vyavhare23@iccs.ac.in' },
{ email: 'tanmay.meshram23@iccs.ac.in' },
{ email: 'anjali.lokhande23@iccs.ac.in' },
{ email: 'Omkar.Bansude23@iccs.ac.in' },
{ email: 'rohit.bhoite23@iccs.ac.in' },
{ email: 'rohit.bhosale23@iccs.ac.in' },
{ email: 'sakshi.sonavane23@iccs.ac.in' },
{ email: 'harshada.wable23@iccs.ac.in' },
{ email: 'pranoti.ghogare23@iccs.ac.in' },
{ email: 'pratik.gawai23@iccs.ac.in' },
{ email: 'rutik.kadam23@iccs.ac.in' },
{ email: 'saniya.chinchole23@iccs.ac.in' },
{ email: 'yash.ghodekar23@iccs.ac.in' },
{ email: 'mrunal.shinde23@iccs.ac.in' },
{ email: 'rushikesh.patil2301@iccs.ac.in' },
{ email: 'prathamesh.kshirsagar23@iccs.ac.in' },
{ email: 'snehal.gore23@iccs.ac.in' },
{ email: 'anushka.jadhav23@iccs.ac.in' },
{ email: 'vedant.mali23@iccs.ac.in' },
{ email: 'tejas.rajput23@iccs.ac.in' },
{ email: 'siddhi.kamble23@iccs.ac.in' },
{ email: 'vishal.kolpe23@iccs.ac.in' },
{ email: 'prajakta.kadam23@iccs.ac.in' },
{ email: 'pranav.bansude23@iccs.ac.in' },
{ email: 'omkar.darade23@iccs.ac.in' },
{ email: 'pratiksha.munge23@iccs.ac.in' },
{ email: 'darshan.kale23@iccs.ac.in' },
{ email: 'shreyash.gore23@iccs.ac.in' },
{ email: 'prathamesh.ghogare23@iccs.ac.in' },
{ email: 'om.patil2312@iccs.ac.in' },
{ email: 'pranav.ghogare23@iccs.ac.in' },
{ email: 'ananya.pawar23@iccs.ac.in' },
{ email: 'utsavi.kshirsagar23@iccs.ac.in' },
{ email: 'pranjal.patil2323@iccs.ac.in' },
{ email: 'rushikesh.bhujbal23@iccs.ac.in' },
{ email: 'akanksha.gharat23@iccs.ac.in' },
{ email: 'vedanti.jadhav23@iccs.ac.in' },
{ email: 'utkarsha.hake23@iccs.ac.in' },
{ email: 'atharv.chaudhari23@iccs.ac.in' },
{ email: 'atharv.wavale23@iccs.ac.in' },
{ email: 'shreya.sonavane23@iccs.ac.in' },
{ email: 'soham.kadlag23@iccs.ac.in' },
{ email: 'Rohan.Randive23@iccs.ac.in' },
{ email: 'Ankita.Wagh23@iccs.ac.in' },
{ email: 'Raj.Bhujbal23@iccs.ac.in' },
{ email: 'Sarthak.Patil2323@iccs.ac.in' },
{ email: 'Omkar.Bodake23@iccs.ac.in' },
{ email: 'Vedanti.Birari23@iccs.ac.in' },
{ email: 'Atharva.Bhise23@iccs.ac.in' },
{ email: 'Vedanti.Bhalerao23@iccs.ac.in' },
{ email: 'Sayali.Kshirsagar23@iccs.ac.in' },
{ email: 'Samruddhi.Wakchaure23@iccs.ac.in' },
{ email: 'sumedh.ghorpadey23@iccs.ac.in' },
{ email: 'pranav.vyavhare23@iccs.ac.in' },
{ email: 'jeevan.patil2323@iccs.ac.in' },
{ email: 'aditi.tikone23@iccs.ac.in' },
{ email: 'shivani.talekar23@iccs.ac.in' },
{ email: 'tejas.ghodke23@iccs.ac.in' },
{ email: 'atharv.bhoite23@iccs.ac.in' },
{ email: 'siddhi.sutar23@iccs.ac.in' },
{ email: 'omkar.pujari23@iccs.ac.in' },
{ email: 'tanmay.gore23@iccs.ac.in' },
{ email: 'anushka.patil2323@iccs.ac.in' },
{ email: 'Ramesh.Sarode23@iccs.ac.in' },
{ email: 'Isha.Shinde23@iccs.ac.in' },
{ email: 'pranav.tandale23@iccs.ac.in' },
{ email: 'shubham.kshirsagar23@iccs.ac.in' },
{ email: 'rupali.halnor23@iccs.ac.in' },
{ email: 'sharayu.mali23@iccs.ac.in' },
{ email: 'anushka.jadhav2323@iccs.ac.in' },
{ email: 'tanmay.jagtap23@iccs.ac.in' },
{ email: 'komal.ghorpadey23@iccs.ac.in' },
{ email: 'siddhi.jadhav23@iccs.ac.in' },
{ email: 'divya.kamthe23@iccs.ac.in' },
{ email: 'atharv.jadhav23@iccs.ac.in' },
{ email: 'yash.koli23@iccs.ac.in' },
{ email: 'mrunal.kate23@iccs.ac.in' },
{ email: 'siddhi.kale23@iccs.ac.in' },
{ email: 'Omkar.Patil2323@iccs.ac.in' },
{ email: 'mansi.nikam23@iccs.ac.in' },
{ email: 'pratik.patil2311@iccs.ac.in' },
{ email: 'siddhant.kshirsagar23@iccs.ac.in' },
{ email: 'siddhi.takalkar23@iccs.ac.in' },
{ email: 'shweta.sonavane23@iccs.ac.in' },
{ email: 'anushka.malwad23@iccs.ac.in' },
{ email: 'rutuja.jadhav23@iccs.ac.in' },
{ email: 'sharayu.gorad23@iccs.ac.in' },
{ email: 'atharv.jadhav2323@iccs.ac.in' },
{ email: 'atharv.khaire23@iccs.ac.in' },
{ email: 'pratiksha.suryawanshi23@iccs.ac.in' },
{ email: 'Aditya.Mhaske23@iccs.ac.in' },
{ email: 'Samruddhi.Shinde23@iccs.ac.in' },
{ email: 'Ravindra.Mali23@iccs.ac.in' },
{ email: 'Atharv.Nikam23@iccs.ac.in' },
{ email: 'omkar.nikam23@iccs.ac.in' },
{ email: 'shubham.jadhav2323@iccs.ac.in' },
{ email: 'akanksha.kulkarni23@iccs.ac.in' },
{ email: 'mansi.kshirsagar23@iccs.ac.in' },
{ email: 'sujal.jadhav23@iccs.ac.in' },
{ email: 'jeevan.talekar23@iccs.ac.in' },
{ email: 'Atharva.Kharat23@iccs.ac.in' },
{ email: 'Shubham.Shinde23@iccs.ac.in' },
{ email: 'yash.wagholikar23@iccs.ac.in' },
{ email: 'tejas.jagtap23@iccs.ac.in' },
{ email: 'vishal.jadhav23@iccs.ac.in' },
{ email: 'pranav.lokhande23@iccs.ac.in' },
{ email: 'prathamesh.jadhav23@iccs.ac.in' },
{ email: 'aayush.more23@iccs.ac.in' },
{ email: 'omkar.bhadane23@iccs.ac.in' },
{ email: 'rushikesh.sonavane23@iccs.ac.in' },
{ email: 'komal.khairnar23@iccs.ac.in' },
{ email: 'prathamesh.gore23@iccs.ac.in' },
{ email: 'pratik.patil2302@iccs.ac.in' },
{ email: 'gaurav.dhule23@iccs.ac.in' },
{ email: 'rohan.somwanshi23@iccs.ac.in' },
{ email: 'pratiksha.karad23@iccs.ac.in' },
{ email: 'Atharva.Patil2313@iccs.ac.in' },
{ email: 'tejas.kshirsagar23@iccs.ac.in' },
{ email: 'suyash.kawade23@iccs.ac.in' },
{ email: 'vedant.dahibhate23@iccs.ac.in' },
{ email: 'mukund.mate23@iccs.ac.in' },
{ email: 'Atharva.Mali23@iccs.ac.in' },
{ email: 'Atharv.Mali23@iccs.ac.in' },
{ email: 'siddhesh.khairnar23@iccs.ac.in' },
{ email: 'gandhar.halnor23@iccs.ac.in' },

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