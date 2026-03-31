const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');

dotenv.config();

async function testConnection() {
  const uri = process.env.MONGO_URI;
  console.log('--- Database Connection Diagnostic ---');
  console.log(`URI: ${uri?.split('@')[1] ? '***@' + uri.split('@')[1] : 'NOT FOUND'}`);
  
  if (!uri) {
    console.error('ERROR: MONGO_URI is missing from .env');
    return;
  }

  // 1. Test DNS resolution for SRV
  console.log('\n[1/3] Testing DNS Resolution...');
  const hostname = uri.split('//')[1]?.split('/')[0]?.split('?')[0];
  
  if (hostname) {
    dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
      if (err) {
        console.error('DNS SRV Resolution FAILED:', err.code);
        console.log('TIP: This often means your network/ISP blocks SRV lookups. Try changing your DNS (e.g., to 8.8.8.8) or use a VPN.');
      } else {
        console.log('DNS SRV Resolution: SUCCESS');
        addresses.forEach(a => console.log(`  - Target: ${a.name}:${a.port}`));
      }
    });

    dns.lookup(hostname, (err, address) => {
      if (err) {
        console.error('Standard DNS Lookup FAILED:', err.code);
      } else {
        console.log(`Standard DNS Lookup: SUCCESS (${address})`);
      }
    });
  }

  // 2. Attempt Mongoose Connection
  console.log('\n[2/3] Attempting MongoDB Connection...');
  try {
    await mongoose.connect(uri, { 
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000 
    });
    console.log('MongoDB Connection: SUCCESS');
    console.log(`Database name: ${mongoose.connection.name}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('MongoDB Connection FAILED:', err.name);
    console.error('Error Code:', err.code || 'N/A');
    console.error('Message:', err.message);
    
    if (err.message.includes('ECONNREFUSED')) {
      console.log('\nTIP: Connection Refused usually means the server is down or you are not whitelisted.');
    }
  }

  // 3. Check for srv vs non-srv
  if (uri.startsWith('mongodb+srv://')) {
    console.log('\n[3/3] SRV detected.');
    const fallbackUri = uri.replace('mongodb+srv://', 'mongodb://');
    console.log(`Suggestion: If SRV continues to fail, try the legacy format: ${fallbackUri.split('@')[0]}@...`);
  }
}

testConnection();
