// src/utils/hashPasswords.ts
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// IMPORTANT: adjust model import path if your User model path differs
import UserModel from '../models/User'; // this is the TS model you already have

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI missing in .env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB for hashing');
}

async function hashPasswords() {
  try {
    await connectDB();

    const users = await UserModel.find({});
    console.log(`Found ${users.length} users.`);

    let updated = 0;
    for (const user of users) {
      const pw: any = (user as any).password;
      if (!pw) {
        console.log(`- user ${user.loginId || user.email || user._id} has no password. Skipping.`);
        continue;
      }

      // Basic check: bcrypt hashes start with $2a$ or $2b$ or $2y$
      if (typeof pw === 'string' && pw.startsWith('$2')) {
        // already hashed
        continue;
      }

      // hash and update
      const hashed = await bcrypt.hash(String(pw), 10);
      (user as any).password = hashed;
      await user.save();
      updated++;
      console.log(`- hashed password for ${user.loginId || user.email || user._id}`);
    }

    console.log(`Done. ${updated} users updated (passwords hashed).`);
    process.exit(0);
  } catch (err) {
    console.error('Error hashing passwords:', err);
    process.exit(1);
  }
}

hashPasswords();
