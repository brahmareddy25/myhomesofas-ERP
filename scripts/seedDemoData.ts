import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Setup basic models directly to avoid Next.js environment issues in standalone script
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Store'], required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const StoreSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String },
  gstNumber: { type: String, required: true, unique: true },
  managerName: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  gpsCoordinates: { latitude: Number, longitude: Number },
}, { timestamps: true });

const CustomerSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  mobileNumber: { type: String, required: true },
  alternateMobileNumber: { type: String },
  emailAddress: { type: String },
  fullAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  gpsCoordinates: { latitude: Number, longitude: Number },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
}, { timestamps: true });

// Initialize Models
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Store = mongoose.models.Store || mongoose.model('Store', StoreSchema);
const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

const seedDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env.local");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    // Clear existing data for a clean slate
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Store.deleteMany({});
    await Customer.deleteMany({});

    // 1. Create Stores
    console.log("Creating stores...");
    const store1 = await Store.create({
      storeName: "My Home Sofas - Downtown",
      address: "123 Main Street, Downtown Area",
      contactNumber: "9876543210",
      email: "downtown@myhomesofas.com",
      gstNumber: "22AAAAA0000A1Z5",
      managerName: "Rahul Sharma",
      isActive: true,
      gpsCoordinates: { latitude: 28.6139, longitude: 77.2090 }
    });

    const store2 = await Store.create({
      storeName: "My Home Sofas - Westside",
      address: "456 Westside Boulevard",
      contactNumber: "9876543211",
      email: "westside@myhomesofas.com",
      gstNumber: "22BBBBB0000A1Z5",
      managerName: "Priya Patel",
      isActive: true,
      gpsCoordinates: { latitude: 28.5355, longitude: 77.1561 }
    });

    // 2. Create Users
    console.log("Creating users...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    const storePassword = await bcrypt.hash("store123", 10);

    await User.create({
      username: "admin",
      password: adminPassword,
      role: "Admin",
      isActive: true
    });

    await User.create({
      username: "store_downtown",
      password: storePassword,
      role: "Store",
      storeId: store1._id,
      isActive: true
    });

    await User.create({
      username: "store_westside",
      password: storePassword,
      role: "Store",
      storeId: store2._id,
      isActive: true
    });

    // 3. Create Customers
    console.log("Creating customers...");
    const customers = [
      {
        customerName: "Amit Kumar",
        age: 35,
        gender: "Male",
        mobileNumber: "9988776655",
        fullAddress: "Flat 402, Sunshine Apartments, Sector 10",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110001",
        storeId: store1._id
      },
      {
        customerName: "Sneha Reddy",
        age: 28,
        gender: "Female",
        mobileNumber: "9988776656",
        fullAddress: "Villa 15, Green Park, Sector 20",
        city: "Gurugram",
        state: "Haryana",
        pincode: "122001",
        storeId: store1._id
      },
      {
        customerName: "Vikram Singh",
        age: 45,
        gender: "Male",
        mobileNumber: "9988776657",
        fullAddress: "House No 50, Rose Garden",
        city: "Noida",
        state: "UP",
        pincode: "201301",
        storeId: store2._id
      },
      {
        customerName: "Anjali Gupta",
        age: 32,
        gender: "Female",
        mobileNumber: "9988776658",
        fullAddress: "A-Block, Vasant Vihar",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110057",
        storeId: store2._id
      }
    ];

    await Customer.insertMany(customers);

    console.log("Database seeded successfully!");
    console.log("Admin Login -> Username: admin, Password: admin123");
    console.log("Store Login -> Username: store_downtown, Password: store123");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

seedDatabase();
