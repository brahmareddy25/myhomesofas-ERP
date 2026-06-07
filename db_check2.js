const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected");
  const db = mongoose.connection.db;
  const docs = await db.collection('measurements').find({ "previewImages.isometric": { $exists: true } }).sort({createdAt: -1}).toArray();
  console.log("Docs with previewImages:", docs.length);
  if (docs.length > 0) {
    const m = docs[0];
    console.log("Latest with previewImages ID:", m._id);
    console.log("isometric length:", m.previewImages.isometric ? m.previewImages.isometric.length : 0);
    console.log("top length:", m.previewImages.top ? m.previewImages.top.length : 0);
    console.log("front length:", m.previewImages.front ? m.previewImages.front.length : 0);
  } else {
    console.log("No measurements have previewImages at all!");
  }
  process.exit(0);
}
check();
