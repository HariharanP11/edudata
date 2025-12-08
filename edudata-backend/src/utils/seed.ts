import "dotenv/config";
import { connectDB } from "../config/db";
import User from "../models/User";
import Institution from "../models/Institution";
import bcrypt from "bcryptjs";

async function seed() {
  await connectDB();

  console.log("Seeding data...");

  const adminEmail = "admin@test.com";
  let admin = await User.findOne({ email: adminEmail });

  if (!admin) {
    admin = await User.create({
      name: "Admin",
      email: adminEmail,
      password: await bcrypt.hash("password123", 10),
      role: "admin"
    });
  }

  console.log("Admin user:", adminEmail);

  process.exit(0);
}

seed();
