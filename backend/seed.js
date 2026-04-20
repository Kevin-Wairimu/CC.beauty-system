import dotenv from "dotenv";
import { prisma } from "./config/db.js";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env"), override: true });

const services = [
  // MAKEUP
  { name: "Touch Up", category: "MAKEUP", price: "1500", image: "/images/Touch up makeup.JPG" },
  { name: "Soft Glam", category: "MAKEUP", price: "2000", image: "/images/soft glam.JPG" },
  { name: "Full Makeup", category: "MAKEUP", price: "2500", image: "/images/full makeup.JPG" },
  { name: "Bridal Makeup", category: "MAKEUP", price: "4000", image: "/images/bridal makeup.JPG" },
  { name: "Bridal Team", category: "MAKEUP", price: "3000", image: "/images/Brides makeup.JPG" },
  { name: "Photo Shoot", category: "MAKEUP", price: "2000 - 3500", image: "/images/full makeup.JPG" },

  // WIGS
  { name: "Wig Installation (Gluing)", category: "WIGS", price: "1000", image: "/images/Wig styling.JPG" },
  { name: "Wig Gluing + Edges", category: "WIGS", price: "1200", image: "/images/Wig styling.JPG" },
  { name: "Wig Styling", category: "WIGS", price: "2000 - 3000", image: "/images/Wig styling.JPG" },
  { name: "Wig Curling", category: "WIGS", price: "1500 - 2500", image: "/images/Wig curling.JPG" },
  { name: "Wig Flat Ironing", category: "WIGS", price: "1000", image: "/images/flat iron.JPG" },
  { name: "Wig Tinting", category: "WIGS", price: "300", image: "/images/Wig curling.JPG" },
  { name: "Lace Cutting", category: "WIGS", price: "200", image: "/images/Wig styling.JPG" },
  { name: "Wig Laundry", category: "WIGS", price: "1000", image: "/images/Wig laundry.JPG" },

  // LASHES
  { name: "Cluster", category: "LASHES", price: "1500", image: "/images/Cluster lashes.JPG" },
  { name: "Individual Classic", category: "LASHES", price: "2500", image: "/images/classic.JPG" },
  { name: "Hybrid", category: "LASHES", price: "3500", image: "/images/hybrid.JPG" },
  { name: "Volume", category: "LASHES", price: "4500", image: "/images/volume.JPG" },
  { name: "Mega Volume", category: "LASHES", price: "6500", image: "/images/mega.JPG" },
  { name: "Russian", category: "LASHES", price: "7500", image: "/images/mega.JPG" },
  { name: "Mink Lashes", category: "LASHES", price: "8500", image: "/images/mink lashes.JPG" },
  { name: "Eyebrow Tinting", category: "LASHES", price: "500" },
  { name: "Strip Lashes", category: "LASHES", price: "200", image: "/images/strip lashes.JPG" },
  { name: "Eyebrow Trimming", category: "LASHES", price: "150" },
  { name: "Threading", category: "LASHES", price: "300" },
  { name: "Tinting", category: "LASHES", price: "300" },

  // LOCS
  { name: "Invisible Locs", category: "HAIR", price: "1700" },
  { name: "Boho Locs", category: "HAIR", price: "2000" },
  { name: "Starter Locs Retie", category: "HAIR", price: "2000" },
  { name: "Locs Retouch", category: "HAIR", price: "1500" },
  { name: "Locs Styling", category: "HAIR", price: "500" },

  // NAILS / BEAUTY SERVICES
  { name: "Cut and Filing", category: "NAILS", price: "200" },
  { name: "Plain Manicure", category: "NAILS", price: "500", image: "/images/Manicure.JPG" },
  { name: "Plain Pedicure", category: "NAILS", price: "700", image: "/images/milk and honey.JPG" },
  { name: "Gel", category: "NAILS", price: "500" },
  { name: "Manicure Gel", category: "NAILS", price: "1000", image: "/images/Manicure.JPG" },
  { name: "Pedicure Gel", category: "NAILS", price: "1200", image: "/images/milk and honey.JPG" },
  { name: "Tips Gel", category: "NAILS", price: "1000", image: "/images/tips builder.JPG" },
  { name: "Tips Builder", category: "NAILS", price: "1500", image: "/images/tips builder.JPG" },
  { name: "Tips Gum Gel", category: "NAILS", price: "2000", image: "/images/Overlay gumgel.JPG" },
  { name: "Overlay Builder", category: "NAILS", price: "1000", image: "/images/Overlay builder.JPG" },
  { name: "Overlay Gum Gel", category: "NAILS", price: "1500", image: "/images/Overlay gumgel.JPG" },
  { name: "Sculpting", category: "NAILS", price: "3000", image: "/images/Sculpting.JPG" },
  { name: "Gel (Full Set)", category: "NAILS", price: "2500", image: "/images/Gel x.JPG" },
  { name: "Overlay Acrylic", category: "NAILS", price: "3000", image: "/images/acrylic overlay.JPG" },
  { name: "Tips Acrylic", category: "NAILS", price: "3500", image: "/images/acrylic overlay.JPG" },
  { name: "Nail Art (Per Nail)", category: "NAILS", price: "50" },
  { name: "Soak Off (Tips)", category: "NAILS", price: "300" },
  { name: "Soak Off (Acrylic)", category: "NAILS", price: "500" },

  // ADD-ONS
  { name: "Jelly Pedicure (2 Steps)", category: "NAILS", price: "800", image: "/images/milk and honey.JPG" },
  { name: "Jelly Pedicure (4 Steps)", category: "NAILS", price: "1000", image: "/images/milk and honey.JPG" },
  { name: "Honey", category: "NAILS", price: "500" },
  { name: "Exfoliating", category: "NAILS", price: "300" },
  { name: "Steaming", category: "NAILS", price: "500" },

  // HAIRDRESSING
  { name: "Dread Wash / Braid Hair", category: "HAIR", price: "500", image: "/images/Wash.JPG" },
  { name: "Wash & Straighten", category: "HAIR", price: "300", image: "/images/Wash.JPG" },
  { name: "Wash & Blowdry", category: "HAIR", price: "500", image: "/images/wash and full blowdry.JPG" },
  { name: "Undo Twist Out", category: "HAIR", price: "300 - 500" },
  { name: "Undo Cornrows", category: "HAIR", price: "200" },
  { name: "Undo Braids", category: "HAIR", price: "500" },
  { name: "Wig Lines", category: "HAIR", price: "300" },
  { name: "Kids Lines", category: "HAIR", price: "500", image: "/images/center kids cornrows.JPG" },
  { name: "Adult Lines", category: "HAIR", price: "300 - 600" },
  { name: "Updo Cornrows", category: "HAIR", price: "500" },
  { name: "Fulani Cornrows", category: "HAIR", price: "1500" },
  { name: "Knotless", category: "HAIR", price: "1500 - 2000" },
  { name: "Knotless Twist", category: "HAIR", price: "2000 - 3000" },
  { name: "Crotchets", category: "HAIR", price: "1500" },
  { name: "Stitch Lines", category: "HAIR", price: "2000" },
  { name: "Box Braids", category: "HAIR", price: "1500" },
  { name: "Marley Twists", category: "HAIR", price: "2500 - 3000" },
  { name: "Spring Twists", category: "HAIR", price: "2000 - 3000" },
  { name: "Twist Outs", category: "HAIR", price: "1500" },
  { name: "Mini Twists", category: "HAIR", price: "3000" },
  { name: "Coco Twists", category: "HAIR", price: "1500 - 2000" },
  { name: "Havana Curls", category: "HAIR", price: "2000", image: "/images/Wig styling.JPG" },
  { name: "Gel Styling", category: "HAIR", price: "1500" },
  { name: "Butterfly Locs", category: "HAIR", price: "2500" },
  { name: "Gypsy Locs", category: "HAIR", price: "2000" },
  { name: "Mermaid Braids", category: "HAIR", price: "2000 - 2500" },
  { name: "Italian Braids", category: "HAIR", price: "2000 - 2500" },
  { name: "Natural Twists", category: "HAIR", price: "2500" },
  { name: "Lemonade Braids", category: "HAIR", price: "1700" },
  { name: "Sister Locs Retie", category: "HAIR", price: "2000" },

  // BOHO
  { name: "Boho Braids", category: "HAIR", price: "2000 - 3000" },
  { name: "Boho Extensions: French", category: "HAIR", price: "300" },
  { name: "Boho Extensions: Spanish", category: "HAIR", price: "300" },
  { name: "Boho Extensions: Zulu Bulk", category: "HAIR", price: "300" },
  { name: "Boho Extensions: Italian Curls", category: "HAIR", price: "300" },
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
