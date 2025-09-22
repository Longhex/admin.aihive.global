import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  const hashedPassword = await bcrypt.hash("@Ht12345", 10);
  await prisma.user.create({
    data: {
      username: "supperadmin",
      password: hashedPassword,
      role: Role.SuperAdmin,
    },
  });

  await prisma.setting.deleteMany({});
  await prisma.setting.create({
    data: {
      oriagentToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZjI2YjRhMTAtNDk2Mi00MGM0LTkyODktNmVmMmNlNjI3OWZlIiwiZXhwIjoxNzU5NDc1MDQzLCJpc3MiOiJTRUxGX0hPU1RFRCIsInN1YiI6IkNvbnNvbGUgQVBJIFBhc3Nwb3J0In0.HtmVsL6Sts0CkRRRMsCmuoitC3Wqr0Eh5Vn7b-Gcizc",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
