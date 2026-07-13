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
    name: "Wangari",
    email: "wangari@ccbeauty.com",
    password: "password123",
    role: "staff",
    specialization: ["HAIR", "RECEPTIONIST", "WIGS", "loctician"],
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
    specialization: ["WIGS", "NAILS", "MAKEUP"],
    approveBookings: true,
    manageStaff: true,
    manageServices: true,
  },
  {
    name: "Yvonne",
    email: "vyonnewanjiru105@gmail.com",
    password: "password123",
    role: "manager",
    specialization: ["NAILS"],
    approveBookings: true,
    manageStaff: false,
    manageServices: false,
  },
  {
    name: "Conslate Aluoch Boyi",
    email: "conslateboyi@gmail.com",
    password: "password123",
    role: "manager",
    specialization: ["HAIR"],
    approveBookings: true,
    manageStaff: false,
    manageServices: false,
  },
];

const seedStaff = async () => {
  console.log("Connecting to PostgreSQL...");
  const salt = await bcrypt.genSalt(10);

  for (const s of staffData) {
    const hashedPassword = await bcrypt.hash(s.password, salt);

    try {
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
    } catch (error) {
      // Print everything we can about this specific record's failure
      // before moving on, so one bad record doesn't hide the others.
      console.error(`\n--- FAILED on ${s.name} (${s.email}) ---`);
      console.error("error.message:", error.message);
      console.error("error.code:", error.code);
      console.error("error.meta:", error.meta);
      console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error("--- continuing to next staff member ---\n");
    }
  }

  console.log("--- STAFF & ADMIN COLLECTION SYNC ATTEMPT FINISHED ---");
  process.exit();
};

seedStaff().catch((error) => {
  console.error("\n--- TOP-LEVEL SCRIPT FAILURE ---");
  console.error("error.message:", error.message);
  console.error("error.code:", error.code);
  console.error("error.meta:", error.meta);
  console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
  process.exit(1);
});