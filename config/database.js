const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    if (!mongoUri.startsWith('mongodb+srv://')) {
      console.warn('[MongoDB] Warning: MONGO_URI should use mongodb+srv:// for Atlas clusters.');
    }

    // Let MongoDB Atlas SRV handle defaults. Redundant options often cause SSL Alert 80.
    const options = {
      maxPoolSize: 10,
      minPoolSize: 1,
      connectTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 15000,
    };

    // Disable command buffering to ensure fast failure instead of hanging
    mongoose.set('bufferCommands', false);

    console.log('[MongoDB] Attempting connection...');
    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        const conn = await mongoose.connect(mongoUri, options);
        console.log(`[MongoDB] ✅ Connected to: ${conn.connection.host}`);
        return conn;
      } catch (err) {
        lastError = err;
        retries--;
        if (retries > 0) {
          console.log(`[MongoDB] Retry ${4 - retries}/3 in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    throw lastError;

  } catch (error) {
    console.error('[MongoDB] ❌ Connection error:', error.message);

    // Check if it's a DNS issue
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.error('[MongoDB] 🔴 DNS/Network Issue - trying alternative approach...');
      console.error('Try one of these fixes:');
      console.error('1. Clear DNS: ipconfig /flushdns (Run PowerShell as Admin)');
      console.error('2. Set Node DNS: NODE_OPTIONS="--dns-result-order=ipv4first" npm run dev');
      console.error('3. Restart network: Unplug/plug back your network cable or reboot');
      console.error('4. Check MongoDB Atlas IP whitelist includes your connection IP');
    }

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('[MongoDB] Attempting fallback to local MongoDB...');
      try {
        const localUri = 'mongodb://127.0.0.1:27017/studentsolution_local';
        const conn = await mongoose.connect(localUri, options);
        console.log(`[MongoDB] ✅ Connected to Local Fallback: ${conn.connection.host}`);
        return conn;
      } catch (localErr) {
        console.error('[MongoDB] ❌ Local fallback also failed:', localErr.message);
        console.log('[MongoDB] Continuing in development mode (limited functionality)...');
      }
    }
  }
};

module.exports = connectDB;