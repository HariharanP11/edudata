import "dotenv/config";
import { connectDB } from "../config/db";
import User from "../models/User";
import Institution from "../models/Institution";
import bcrypt from "bcryptjs";

async function seed() {
  await connectDB();

  console.log("Seeding data...");

  const adminLoginId = "admin";
  const adminEmail = "admin@edudata.local";
  const adminPassword = "admin123";

  let admin = await User.findOne({
    $or: [{ email: adminEmail }, { loginId: adminLoginId }],
  });

  if (!admin) {
    admin = await User.create({
      name: "Admin",
      email: adminEmail,
      loginId: adminLoginId,
      password: await bcrypt.hash(adminPassword, 10),
      role: "admin",
    });
  }

  console.log("Admin user seeded:", { loginId: adminLoginId, email: adminEmail });

  process.exit(0);
}

seed();
