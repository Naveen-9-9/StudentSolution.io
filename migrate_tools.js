const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('MONGO_URI not found in .env');
  process.exit(1);
}

const toolSchema = new mongoose.Schema({
  status: String,
  isActive: Boolean
}, { strict: false, collection: 'tools' });

const Tool = mongoose.model('Tool', toolSchema);

async function migrateTools() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    const result = await Tool.updateMany(
      { status: { $exists: false } }, // Only tools without a status
      { $set: { status: 'approved', isActive: true } }
    );

    console.log(`Migration complete. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateTools();
