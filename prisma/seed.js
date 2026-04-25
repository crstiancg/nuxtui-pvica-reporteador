import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const defaultUser = {
  email: "password@gmail.com",
  name: "password",
  password: "password",
};

const departamentos = [
  "Lima",
  "Arequipa",
  "Cusco",
  "Piura",
  "La Libertad",
  "Junin",
  "Puno",
  "Loreto",
  "Ica",
  "Ancash",
];

const provincias = [
  "Lima",
  "Callao",
  "Trujillo",
  "Chiclayo",
  "Huancayo",
  "Cusco",
  "Piura",
  "Iquitos",
  "Puno",
  "Huaraz",
];

const distritos = [
  "Cercado",
  "Miraflores",
  "San Isidro",
  "Los Olivos",
  "Santiago",
  "Wanchaq",
  "Castilla",
  "Punchana",
  "Juliaca",
  "Independencia",
];

function buildCentros(total = 10_000) {
  return Array.from({ length: total }, (_, index) => ({
    departamento: departamentos[index % departamentos.length],
    provincia: provincias[index % provincias.length],
    distrito: `${distritos[index % distritos.length]} ${Math.floor(index / distritos.length) + 1}`,
    codigoUbigeo: String(index + 1).padStart(6, "0"),
  }));
}

async function seedDefaultUser() {
  const hashedPassword = await bcrypt.hash(defaultUser.password, 10);

  await prisma.user.upsert({
    where: {
      email: defaultUser.email,
    },
    update: {
      name: defaultUser.name,
      password: hashedPassword,
      emailVerified: true,
    },
    create: {
      email: defaultUser.email,
      name: defaultUser.name,
      password: hashedPassword,
      emailVerified: true,
    },
  });

  console.log(`Default user ready: ${defaultUser.email}`);
}

async function seedCentros() {
  const centros = buildCentros();
  const chunkSize = 1_000;
  let created = 0;

  for (let index = 0; index < centros.length; index += chunkSize) {
    const chunk = centros.slice(index, index + chunkSize);
    const result = await prisma.centro.createMany({
      data: chunk,
      skipDuplicates: true,
    });

    created += result.count;
  }

  console.log(`Centros ready: ${centros.length} total, ${created} created`);
}

async function main() {
  await seedDefaultUser();
  await seedCentros();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
