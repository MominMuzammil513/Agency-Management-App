import { db } from "@/db/db";
import { users } from "@/db/schemas";
import bcrypt from "bcryptjs";
import { generateId } from "@/lib/generateId";
import { eq } from "drizzle-orm"; // <-- important
import dotenv from "dotenv";

dotenv.config();

async function seedSuperAdmin() {
  try {
    const email = "muzammilaumed2376@gmail.com";

    // Check if super admin already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      console.log("Super Admin already exists:", email);
      return;
    }

    const id = generateId();
    const passwordHash = await bcrypt.hash("Muzammil@@413", 10);

    await db.insert(users).values({
      id,
      name: "Super Admin Muzammil",
      email,
      passwordHash,
      mobile: "8788544513",
      role: "super_admin",
      isActive: true,
      mustResetPassword: false,
      altMobile: null,
      agencyId: null, // Super admin has no agency
    });

    console.log("✅ Super Admin created successfully:", email);
  } catch (error) {
    console.error("❌ Failed to seed Super Admin:", error);
  }
}

seedSuperAdmin();
