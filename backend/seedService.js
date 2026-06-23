import dotenv from "dotenv";
import { prisma } from "./config/db.js";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env"), override: true });

const services = [
  // NAILS
  {
    name: "Manicure Plain",
    category: "NAILS",
    price: "600",
    image: "/images/Manicure.JPG",
  },
  {
    name: "Pedicure Plain",
    category: "NAILS",
    price: "800",
    image: "/images/milk and honey.JPG",
  },
  {
    name: "Manicure Gel",
    category: "NAILS",
    price: "1200",
    image: "/images/Manicure.JPG",
  },
  {
    name: "Pedicure Gel",
    category: "NAILS",
    price: "1500",
    image: "/images/milk and honey.JPG",
  },
  {
    name: "Jelly Pedicure (2 Step)",
    category: "NAILS",
    price: "1000",
    image: "/images/milk and honey.JPG",
  },
  {
    name: "Jelly Pedicure (4 Step)",
    category: "NAILS",
    price: "1200",
    image: "/images/milk and honey.JPG",
  },
  {
    name: "Santorini",
    category: "NAILS",
    price: "1000",
    image: "/images/Manicure.JPG",
  },
  {
    name: "Tips Gel",
    category: "NAILS",
    price: "1200",
    image: "/images/tips builder.JPG",
  },
  {
    name: "Tips Builder",
    category: "NAILS",
    price: "1500",
    image: "/images/tips builder.JPG",
  },
  {
    name: "Tips Gumgel",
    category: "NAILS",
    price: "2000",
    image: "/images/Overlay gumgel.JPG",
  },
  {
    name: "Overlay Builder",
    category: "NAILS",
    price: "1500",
    image: "/images/Overlay builder.JPG",
  },
  {
    name: "Overlay Gumgel",
    category: "NAILS",
    price: "2000",
    image: "/images/Overlay gumgel.JPG",
  },
  {
    name: "Sculpting",
    category: "NAILS",
    price: "3000",
    image: "/images/Sculpting.JPG",
  },
  {
    name: "Gel X",
    category: "NAILS",
    price: "3000",
    image: "/images/Gel x.JPG",
  },
  {
    name: "Acrylics",
    category: "NAILS",
    price: "3500",
    image: "/images/acrylic overlay.JPG",
  },
  {
    name: "Acrylic Overlay",
    category: "NAILS",
    price: "3000",
    image: "/images/acrylic overlay.JPG",
  },

  // LASHES
  {
    name: "Clusters",
    category: "LASHES",
    price: "1500",
    image: "/images/Cluster lashes.JPG",
  },
  {
    name: "Individual Classic",
    category: "LASHES",
    price: "2500",
    image: "/images/classic.JPG",
  },
  {
    name: "Individual Hybrid",
    category: "LASHES",
    price: "3500",
    image: "/images/hybrid.JPG",
  },
  {
    name: "Individual Volume",
    category: "LASHES",
    price: "4500",
    image: "/images/volume.JPG",
  },
  {
    name: "Individual Mega Volume",
    category: "LASHES",
    price: "6500",
    image: "/images/mega.JPG",
  },
  {
    name: "Individual Recession (Refill/Retouch)",
    category: "LASHES",
    price: "1500",
    image: "/images/Refill.JPG",
  },
  {
    name: "Mink Lashes",
    category: "LASHES",
    price: "8500",
    image: "/images/mink lashes.JPG",
  },
  {
    name: "Strip Lashes",
    category: "LASHES",
    price: "250",
    image: "/images/strip lashes.JPG",
  },

  // WIGS
  {
    name: "Wig Laundry",
    category: "WIGS",
    price: "1000",
    image: "/images/Wig laundry.JPG",
  },
  {
    name: "Wig Gluing",
    category: "WIGS",
    price: "1000",
    image: "/images/Wig styling.JPG",
  },
  {
    name: "Gluing + Edges",
    category: "WIGS",
    price: "1100",
    image: "/images/Wig styling.JPG",
  },
  {
    name: "Wig Styling",
    category: "WIGS",
    price: "2000",
    image: "/images/Wig styling.JPG",
  },
  {
    name: "Flat Iron",
    category: "WIGS",
    price: "1000",
    image: "/images/flat iron.JPG",
  },
  {
    name: "Tinting",
    category: "WIGS",
    price: "300",
    image: "/images/Wig curling.JPG",
  },
  {
    name: "Lace Cutting",
    category: "WIGS",
    price: "200",
    image: "/images/Wig styling.JPG",
  },

  // MAKEUP
  {
    name: "Touch Up",
    category: "MAKEUP",
    price: "1500",
    image: "/images/Touch up makeup.JPG",
  },
  {
    name: "Soft Glam",
    category: "MAKEUP",
    price: "2000",
    image: "/images/soft glam.JPG",
  },
  {
    name: "Full Makeup",
    category: "MAKEUP",
    price: "2500",
    image: "/images/full makeup.JPG",
  },
  {
    name: "Bride's Makeup",
    category: "MAKEUP",
    price: "3500-4000",
    image: "/images/bridal makeup.JPG",
  },
  {
    name: "Bridal Team",
    category: "MAKEUP",
    price: "3000",
    image: "/images/Brides makeup.JPG",
  },

  // EYEBROWS
  {
    name: "Eyebrow Tinting",
    category: "EYEBROWS",
    price: "500",
  },
  {
    name: "Eyebrow Threading",
    category: "EYEBROWS",
    price: "300",
  },
  {
    name: "Eyebrow Tweezing",
    category: "EYEBROWS",
    price: "300",
  },
  {
    name: "Eyebrow Trimming",
    category: "EYEBROWS",
    price: "200",
  },

  // FACIAL
  {
    name: "Mini Facial",
    category: "FACIAL",
    price: "2000",
    image: "/images/mini facial.JPG",
  },
  {
    name: "Scrubbing",
    category: "FACIAL",
    price: "1500",
    image: "/images/scrubbing.JPG",
  },
  {
    name: "Full Facial",
    category: "FACIAL",
    price: "3500",
    image: "/images/full facial.JPG",
  },

  // HAIR
  {
    name: "Hair Wash",
    category: "HAIR",
    price: "500",
    image: "/images/Wash.JPG",
  },
  {
    name: "Wash and Straightening",
    category: "HAIR",
    price: "500",
    image: "/images/Wash.JPG",
  },
  {
    name: "Wash and Full Blowdry",
    category: "HAIR",
    price: "1000",
    image: "/images/wash and full blowdry.JPG",
  },
  {
    name: "Undoing Twistouts",
    category: "HAIR",
    price: "500",
  },
  {
    name: "Undoing Cornrows",
    category: "HAIR",
    price: "500",
  },
  {
    name: "Undoing Braids",
    category: "HAIR",
    price: "500",
  },
  {
    name: "Kids Lines",
    category: "HAIR",
    price: "300",
  },
  {
    name: "Big Lines",
    category: "HAIR",
    price: "500",
  },
  {
    name: "Lip Cornrows",
    category: "HAIR",
    price: "500",
  },
  {
    name: "Fulani Cornrows",
    category: "HAIR",
    price: "1500",
  },
  {
    name: "Back Ghanaians",
    category: "HAIR",
    price: "1000",
  },
  {
    name: "Up Ghanaians",
    category: "HAIR",
    price: "1500",
  },
  {
    name: "Knotless Braids",
    category: "HAIR",
    price: "1500 - 3000",
  },
  {
    name: "Knotless Twist Braids",
    category: "HAIR",
    price: "2000",
  },
  {
    name: "Jumbo Knotless Braids",
    category: "HAIR",
    price: "1500",
  },
  {
    name: "Crochets",
    category: "HAIR",
    price: "1500",
  },
  {
    name: "Stitch Lines",
    category: "HAIR",
    price: "2000 - 3500",
  },
  {
    name: "Box Braids",
    category: "HAIR",
    price: "1500",
  },
  {
    name: "Boho Knotless Braids",
    category: "HAIR",
    price: "2000",
  },
  {
    name: "Boho Bob Braids",
    category: "HAIR",
    price: "2000",
  },
  {
    name: "Latest Braids",
    category: "HAIR",
    price: "2000",
  },
  {
    name: "Marley Twists",
    category: "HAIR",
    price: "2000",
  },
  {
    name: "Spring Twists",
    category: "HAIR",
    price: "2000",
  },
  {
    name: "Twist Outs",
    category: "HAIR",
    price: "1500",
  },
  {
    name: "Mini Twists",
    category: "HAIR",
    price: "3000",
  },
  {
    name: "Coily Twists",
    category: "HAIR",
    price: "1500",
  },
  {
    name: "Havana Curl",
    category: "HAIR",
    price: "2000",
  },
  {
    name: "Invisible Locs",
    category: "HAIR",
    price: "1700",
  },
  {
    name: "Gel Styling",
    category: "HAIR",
    price: "1500",
  },
  {
    name: "Butterfly Locs",
    category: "HAIR",
    price: "2500",
  },
  {
    name: "Gypsy Locs",
    category: "HAIR",
    price: "2000",
  },
  {
    name: "Mermaid Braids",
    category: "HAIR",
    price: "2000",
  },
  {
    name: "Italian Curls",
    category: "HAIR",
    price: "2000",
  },
  {
    name: "Natural Twists",
    category: "HAIR",
    price: "2500",
  },
  {
    name: "Lemonade Braids",
    category: "HAIR",
    price: "1700",
  },
  {
    name: "Boho Braids Cornrows",
    category: "HAIR",
    price: "2000",
  },
  {
    name: "Sisterlocs Retouch",
    category: "HAIR",
    price: "2000",
  },
  {
    name: "Loc Retwist",
    category: "HAIR",
    price: "1500",
  },
  {
    name: "Boho Locks",
    category: "HAIR",
    price: "2000",
  },
];

const seedData = async () => {
  try {
    console.log("Cleaning up database...");
    await prisma.appointment.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();

    console.log("Seeding admin user...");
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash("admin123", salt);
    
    await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@ccbeauty.com",
        password: adminPassword,
        role: "admin",
        manageStaff: true,
        manageServices: true,
        approveBookings: true
      }
    });

    console.log("Seeding main staff (including Ceisey as Admin)...");
    const ceiseyPassword = await bcrypt.hash("cynthiawairimu@2022", salt);
    const staffPassword = await bcrypt.hash("password123", salt);

    await prisma.user.createMany({
      data: [
        { name: "Ceisey", email: "ceisey@ccbeauty.com", password: ceiseyPassword, role: "admin", specialization: ["WIGS", "NAILS"] },
        { name: "Steve", email: "steve@ccbeauty.com", password: staffPassword, role: "staff", specialization: ["NAILS"] },
        { name: "Sam", email: "sam@ccbeauty.com", password: staffPassword, role: "staff", specialization: ["MAKEUP", "LASHES", "NAILS"] },
        { name: "Wangari", email: "wangari@ccbeauty.com", password: staffPassword, role: "staff", specialization: ["HAIR", "RECEPTIONIST"] },
        { name: "Milka", email: "milka@ccbeauty.com", password: staffPassword, role: "staff", specialization: ["HAIR"] },
      ]
    });

    console.log("Seeding services...");
    await prisma.service.createMany({
      data: services
    });

    console.log("--- SEEDING COMPLETE ---");
    process.exit();
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
