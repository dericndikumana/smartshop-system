import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // 1. Create Core Roles
  const roles = [
    { name: "SUPER_ADMIN", description: "System Administrator" },
    { name: "SHOP_ADMIN", description: "Shop Owner / Manager" },
    { name: "CASHIER", description: "Point of Sale Cashier" },
  ]

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    })
  }
  console.log("✅ Roles seeded")

  // 2. Create Default Super Admin
  const superAdminRole = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } })
  
  if (!superAdminRole) {
    throw new Error("Super Admin role not found!")
  }

  const hashedPassword = await bcrypt.hash("Admin123!", 10)

  const adminEmail = "admin@shopcore.com"

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      name: "System Admin",
      email: adminEmail,
      password: hashedPassword,
      roleId: superAdminRole.id,
      status: "ACTIVE",
    },
  })
  console.log(`✅ Default Super Admin created: ${adminEmail} / Admin123!`)
  
  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
