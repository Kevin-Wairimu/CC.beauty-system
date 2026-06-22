import { prisma } from "./config/db.js";

const fetchStaff = async () => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        OR: [{ role: "staff" }, { role: "admin" }, { role: "manager" }],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialization: true,
      },
    });

    console.log("--- STAFF MEMBERS IN SUPABASE ---");
    console.log(JSON.stringify(staff, null, 2));
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

fetchStaff();