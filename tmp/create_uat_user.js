require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./apps/users/data-access/userModel');

async function createUatUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'uat-tester@studentsolution.ai';
    const password = 'Password123!';
    const name = 'UAT Tester';

    let user = await User.findOne({ email });
    if (user) {
      console.log('UAT user already exists. Updating password...');
      user.password = password;
      await user.save();
    } else {
      console.log('Creating new UAT user...');
      user = new User({ email, password, name });
      await user.save();
    }

    console.log('\u2705 UAT User Ready:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to create UAT user:', err);
    process.exit(1);
  }
}

createUatUser();
