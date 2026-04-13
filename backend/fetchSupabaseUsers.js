import { prisma } from "./config/db.js";

const fetchUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialization: true
      }
    });
    console.log("--- CURRENT USERS IN SUPABASE ---");
    console.log(JSON.stringify(users, null, 2));
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

fetchUsers();
