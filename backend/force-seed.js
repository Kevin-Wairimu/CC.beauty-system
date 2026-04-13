import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from './models/Service.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const services = [
  { name: "Manicure Plain", category: "NAILS", price: "600", image: "/images/Manicure.JPG" },
  { name: "Pedicure Plain", category: "NAILS", price: "800", image: "/images/milk and honey.JPG" },
  { name: "Manicure Gel", category: "NAILS", price: "1200", image: "/images/Manicure.JPG" },
  { name: "Pedicure Gel", category: "NAILS", price: "1500", image: "/images/milk and honey.JPG" },
  { name: "Jelly Pedicure (2 Step)", category: "NAILS", price: "1000", image: "/images/milk and honey.JPG" },
  { name: "Jelly Pedicure (4 Step)", category: "NAILS", price: "1200", image: "/images/milk and honey.JPG" },
  { name: "Santorini", category: "NAILS", price: "1000", image: "/images/Manicure.JPG" },
  { name: "Tips Gel", category: "NAILS", price: "1200", image: "/images/tips builder.JPG" },
  { name: "Tips Builder", category: "NAILS", price: "1500", image: "/images/tips builder.JPG" },
  { name: "Tips Gumgel", category: "NAILS", price: "2000", image: "/images/Overlay gumgel.JPG" },
  { name: "Overlay Builder", category: "NAILS", price: "1500", image: "/images/Overlay builder.JPG" },
  { name: "Overlay Gumgel", category: "NAILS", price: "2000", image: "/images/Overlay gumgel.JPG" },
  { name: "Sculpting", category: "NAILS", price: "3000", image: "/images/Sculpting.JPG" },
  { name: "Gel X", category: "NAILS", price: "3000", image: "/images/Gel x.JPG" },
  { name: "Acrylics", category: "NAILS", price: "3500", image: "/images/acrylic overlay.JPG" },
  { name: "Acrylic Overlay", category: "NAILS", price: "3000", image: "/images/acrylic overlay.JPG" },
  { name: "Clusters", category: "LASHES", price: "1500", image: "/images/Cluster lashes.JPG" },
  { name: "Individual Classic", category: "LASHES", price: "2500", image: "/images/classic.JPG" },
  { name: "Individual Hybrid", category: "LASHES", price: "3500", image: "/images/hybrid.JPG" },
  { name: "Individual Volume", category: "LASHES", price: "4500", image: "/images/volume.JPG" },
  { name: "Individual Mega Volume", category: "LASHES", price: "6500", image: "/images/mega.JPG" },
  { name: "Individual Recession (Refill/Retouch)", category: "LASHES", price: "1500", image: "/images/Refill.JPG" },
  { name: "Mink Lashes", category: "LASHES", price: "8500", image: "/images/mink lashes.JPG" },
  { name: "Strip Lashes", category: "LASHES", price: "250", image: "/images/strip lashes.JPG" },
  { name: "Wig Laundry", category: "WIGS", price: "1000", image: "/images/Wig laundry.JPG" },
  { name: "Wig Gluing", category: "WIGS", price: "1000", image: "/images/Wig styling.JPG" },
  { name: "Gluing + Edges", category: "WIGS", price: "1100", image: "/images/Wig styling.JPG" },
  { name: "Wig Styling", category: "WIGS", price: "2000", image: "/images/Wig styling.JPG" },
  { name: "Flat Iron", category: "WIGS", price: "1000", image: "/images/flat iron.JPG" },
  { name: "Tinting", category: "WIGS", price: "300", image: "/images/Wig curling.JPG" },
  { name: "Cut Lacing", category: "WIGS", price: "200", image: "/images/Wig styling.JPG" },
  { name: "Touch Up", category: "MAKEUP", price: "1500", image: "/images/Touch up makeup.JPG" },
  { name: "Soft Glam", category: "MAKEUP", price: "2000", image: "/images/soft glam.JPG" },
  { name: "Full Makeup", category: "MAKEUP", price: "2500", image: "/images/full makeup.JPG" },
  { name: "Bridal Makeup", category: "MAKEUP", price: "3500", image: "/images/bridal makeup.JPG" },
  { name: "Bridal Team", category: "MAKEUP", price: "3000", image: "/images/Brides makeup.JPG" },
  { name: "Eyebrow Tinting", category: "EYEBROWS", price: "500", image: "/images/Touch up makeup.JPG" },
  { name: "Eyebrow Threading", category: "EYEBROWS", price: "300", image: "/images/Touch up makeup.JPG" },
  { name: "Eyebrow Tweezing", category: "EYEBROWS", price: "300", image: "/images/Touch up makeup.JPG" },
  { name: "Eyebrow Trimming", category: "EYEBROWS", price: "200", image: "/images/Touch up makeup.JPG" },
  { name: "Mini Facial", category: "FACIAL", price: "2000", image: "/images/mini facial.JPG" },
  { name: "Scrubbing", category: "FACIAL", price: "1500", image: "/images/scrubbing.JPG" },
  { name: "Full Facial", category: "FACIAL", price: "3500", image: "/images/full facial.JPG" },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
    console.log('✅ Connected.');
    await Service.deleteMany({});
    await Service.insertMany(services);
    console.log('✅ Catalog SYNCED.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
}

seed();
