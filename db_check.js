const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected");
  const db = mongoose.connection.db;
  const latest = await db.collection('measurements').find().sort({createdAt: -1}).limit(1).toArray();
  if (latest.length > 0) {
    const m = latest[0];
    console.log("Latest measurement ID:", m._id);
    console.log("Has previewImages?", !!m.previewImages);
    if (m.previewImages) {
      console.log("isometric length:", m.previewImages.isometric ? m.previewImages.isometric.length : 0);
      console.log("top length:", m.previewImages.top ? m.previewImages.top.length : 0);
      console.log("front length:", m.previewImages.front ? m.previewImages.front.length : 0);
    }
  } else {
    console.log("No measurements found");
  }
  process.exit(0);
}
check();
