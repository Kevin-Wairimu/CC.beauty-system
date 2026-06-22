import dotenv from "dotenv";
import { execSync } from "child_process";
import { prisma as remotePrisma } from "../config/db.js";

dotenv.config();

// ---------- 1. Dump remote Supabase DB ----------
const dumpFile = "supabase_dump.sql";
console.log("🔽 Dumping remote Supabase DB…");
execSync(`pg_dump "${process.env.DATABASE_URL}" -Fc -f ${dumpFile}`, { stdio: "inherit" });
console.log(`✅ Dump saved to ${dumpFile}`);

// ---------- 2. Restore into local DB ----------
if (!process.env.LOCAL_DATABASE_URL) {
  console.error("❌ LOCAL_DATABASE_URL not set – aborting restore.");
  process.exit(1);
}
console.log("🔼 Restoring dump into local DB…");
execSync(`pg_restore --clean --no-owner --no-acl -d "${process.env.LOCAL_DATABASE_URL}" ${dumpFile}`, { stdio: "inherit" });
console.log("✅ Local DB restored.");

// ---------- 3. Sync staff members ----------
(async () => {
  console.log("🔁 Syncing staff records…");
  const staff = await remotePrisma.user.findMany({
    where: { OR: [{ role: "staff" }, { role: "admin" }] },
  });

  const { PrismaClient } = await import("@prisma/client");
  const localPrisma = new PrismaClient({
    datasources: { db: { url: process.env.LOCAL_DATABASE_URL } },
  });

  for (const s of staff) {
    const upsertData = {
      where: { email: s.email },
      update: {
        name: s.name,
        role: s.role,
        specialization: s.specialization,
        approveBookings: s.approveBookings,
        manageStaff: s.manageStaff,
        manageServices: s.manageServices,
        ...(s.password && { password: s.password }),
      },
      create: {
        name: s.name,
        email: s.email,
        password: s.password,
        role: s.role,
        specialization: s.specialization,
        approveBookings: s.approveBookings,
        manageStaff: s.manageStaff,
        manageServices: s.manageServices,
      },
    };
    await localPrisma.user.upsert(upsertData);
    console.log(`🔹 Synced ${s.email}`);
  }

  await localPrisma.$disconnect();
  console.log("✅ Staff sync complete.");
  process.exit(0);
})();
