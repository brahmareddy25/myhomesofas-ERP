import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import Store from "./src/models/Store";
import User from "./src/models/User";
import Customer from "./src/models/Customer";
import Measurement from "./src/models/Measurement";
import Quotation from "./src/models/Quotation";
import Invoice from "./src/models/Invoice";

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/myhomesofas";
    console.log("Connecting to MongoDB:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // 1. Remove all dummy data
    console.log("Clearing existing data...");
    await Store.deleteMany({});
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Measurement.deleteMany({});
    await Quotation.deleteMany({});
    await Invoice.deleteMany({});
    console.log("Existing dummy data removed.");

    // 2. Create Stores
    console.log("Creating Stores...");
    const kakinadaStore = new Store({
      storeName: "My Home Sofas - Kakinada",
      address: "ATCHAMPETA JUNCTION, to, Pithapuram - Kakinada Rd, beside Mahindra Showroom, Timmapuram",
      city: "Kakinada",
      state: "Andhra Pradesh",
      pincode: "533005",
      contactNumber: "9876543210",
      email: "kakinada@myhomesofas.com",
      status: "Active",
      managerName: "Kakinada Manager",
      gstNumber: "37ATMPC6443J2ZG" // Using 37 for AP
    });
    await kakinadaStore.save();

    const hydStore = new Store({
      storeName: "My Home Sofas - Hyderabad",
      address: "Plot No: 107, Survey No: 108, Mallampet Qutabullapur (M)",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500090",
      contactNumber: "9876543211",
      email: "hyderabad@myhomesofas.com",
      status: "Active",
      managerName: "Hyderabad Manager",
      gstNumber: "36ATMPC6443J2ZG"
    });
    await hydStore.save();
    console.log("Stores created successfully.");

    // 3. Create Users (Credentials)
    console.log("Creating Users...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const kakinadaUser = new User({
      username: "kakinada",
      password: hashedPassword,
      role: "Store",
      storeId: kakinadaStore._id,
      isActive: true
    });
    await kakinadaUser.save();

    const hydUser = new User({
      username: "hyderabad",
      password: hashedPassword,
      role: "Store",
      storeId: hydStore._id,
      isActive: true
    });
    await hydUser.save();
    
    // Create an Admin user just in case
    const adminUser = new User({
      username: "admin",
      password: await bcrypt.hash("admin123", salt),
      role: "Admin",
      isActive: true
    });
    await adminUser.save();

    console.log("Users created successfully.");
    console.log("-----------------------------------------");
    console.log("CREDENTIALS:");
    console.log("Store 1 (Kakinada): username: kakinada | password: password123");
    console.log("Store 2 (Hyderabad): username: hyderabad | password: password123");
    console.log("Admin User: username: admin | password: admin123");
    console.log("-----------------------------------------");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB. Seed complete.");
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
