import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

import dbConnect from "./src/lib/mongodb";
import MaterialCatalog from "./src/models/MaterialCatalog";
import Store from "./src/models/Store";

async function seed() {
  await dbConnect();
  
  const store = await Store.findOne();
  if (!store) {
    console.log("No store found! Cannot seed catalogs without a storeId.");
    process.exit(1);
  }

  const sampleCatalogs = [
    {
      storeId: store._id,
      name: "Premium Velvet Collection",
      colors: [
        { name: "Royal Blue", code: "#1e3a8a" },
        { name: "Emerald Green", code: "#064e3b" },
        { name: "Crimson Red", code: "#991b1b" },
        { name: "Charcoal Grey", code: "#374151" }
      ]
    },
    {
      storeId: store._id,
      name: "Luxury Leather",
      colors: [
        { name: "Saddle Brown", code: "#8b4513" },
        { name: "Midnight Black", code: "#000000" },
        { name: "Ivory White", code: "#fffff0" },
        { name: "Oxblood", code: "#4a0404" }
      ]
    },
    {
      storeId: store._id,
      name: "Breathable Linen",
      colors: [
        { name: "Oatmeal", code: "#e3dac9" },
        { name: "Sage Green", code: "#9dc183" },
        { name: "Dusty Rose", code: "#dcae96" },
        { name: "Sky Blue", code: "#87ceeb" }
      ]
    }
  ];

  console.log("Clearing existing catalogs...");
  await MaterialCatalog.deleteMany({});

  console.log("Inserting sample catalogs...");
  await MaterialCatalog.insertMany(sampleCatalogs);

  console.log("Done! Seeded 3 catalogs.");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
