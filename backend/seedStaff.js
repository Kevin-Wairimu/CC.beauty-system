import dotenv from "dotenv";
import { prisma } from "./config/db.js";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env"), override: true });

const staffData = [
  {
    name: "Steve",
    email: "steve@ccbeauty.com",
    password: "password123",
    role: "staff",
    specialization: ["NAILS", "WIGS"],
  },
  {
    name: "Purity",
    email: "purity@ccbeauty.com",
    password: "password123",
    role: "staff",
    specialization: ["MAKEUP", "WIGS", "LASHES", "EYEBROWS"],
  },
  {
    name: "Sam",
    email: "sam@ccbeauty.com",
    password: "password123",
    role: "staff",
    specialization: ["MAKEUP", "LASHES", "NAILS"],
  },
  {
    name: "Wangari",
    email: "wangari@ccbeauty.com",
    password: "password123",
    role: "staff",
    specialization: ["HAIR", "RECEPTIONIST", "WIGS", "loctician"],
  },
  {
    name: "Milka",
    email: "milka@ccbeauty.com",
    password: "password123",
    role: "staff",
    specialization: ["HAIR", "loctician"],
  },
  {
    name: "Jenny",
    email: "jenny@ccbeauty.com",
    password: "password123",
    role: "staff",
    specialization: ["LASHES"],
  },
  {
    name: "Ceisey",
    email: "ccbeautyclinic21@gmail.com",
    password: "cynthiawairimu@2022",
    role: "admin",
    specialization: ["WIGS", "NAILS", "MAKEUP"], // Added specializations to make her 'Staff'
    approveBookings: true,
    manageStaff: true,
    manageServices: true,
  },
];

const seedStaff = async () => {
  try {
    console.log("Connecting to PostgreSQL...");
    const salt = await bcrypt.genSalt(10);

    for (const s of staffData) {
      const hashedPassword = await bcrypt.hash(s.password, salt);

      await prisma.user.upsert({
        where: { email: s.email },
        update: {
          name: s.name,
          role: s.role,
          password: hashedPassword,
          specialization: s.specialization,
          approveBookings: s.approveBookings ?? false,
          manageStaff: s.manageStaff ?? false,
          manageServices: s.manageServices ?? false,
        },
        create: {
          ...s,
          password: hashedPassword,
        },
      });
      console.log(`Synced staff: ${s.name} (${s.email})`);
    }

    console.log("--- STAFF & ADMIN COLLECTION SYNCED ---");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedStaff();
