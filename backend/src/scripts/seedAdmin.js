import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedDefaultAdmin } from '../utils/seedAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Standalone seeding entry point (`npm run seed-admin`).
 *
 * The server also seeds automatically on start — this script exists for
 * seeding without booting the API. Both paths share seedDefaultAdmin() so
 * the behaviour can't drift between them.
 */
const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('📦 Connected to MongoDB');

    const { created, username } = await seedDefaultAdmin();

    if (created) {
      console.log('✅ Default admin user created successfully!');
      console.log(`   Username: ${username}`);
      console.log('\n🔐 Please change the default password after first login!');
    } else {
      console.log('⚠️  Admin user already exists');
      console.log(`   Username: ${username}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

run();
