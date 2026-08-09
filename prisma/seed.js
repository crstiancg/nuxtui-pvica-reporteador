import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const defaultUser = {
  email: "password@gmail.com",
  name: "password",
  password: "password",
};

const parametros = [
  { codigoCabecera: "decretoAluminio", valor: "Máximo" },
  { codigoCabecera: "decretoBacteriasColiformesFecales", valor: "Máximo" },
  { codigoCabecera: "decretoBacteriasColiformesTotales", valor: "Máximo" },
  { codigoCabecera: "decretoBacteriasHeterotroficas", valor: "Máximo" },
  { codigoCabecera: "decretoCloro", valor: "Mínimo" },
  { codigoCabecera: "decretoCobre", valor: "Máximo" },
  { codigoCabecera: "decretoConductividad", valor: "Máximo" },
  { codigoCabecera: "decretoCromoTotal", valor: "Máximo" },
  { codigoCabecera: "decretoEColiNmp", valor: "Máximo" },
  { codigoCabecera: "decretoHierro", valor: "Máximo" },
  { codigoCabecera: "decretoHuevosLarvasHelmintos", valor: "Máximo" },
  { codigoCabecera: "decretoManganeso", valor: "Máximo" },
  { codigoCabecera: "decretoNitratos", valor: "Máximo" },
  { codigoCabecera: "decretoNitritosExposicionCorta", valor: "Máximo" },
  { codigoCabecera: "decretoOrganismosVidaLibre", valor: "Máximo" },
  { codigoCabecera: "decretoPh", valor: "Mínimo" },
  { codigoCabecera: "decretoSolidosTotalesDisueltos", valor: "Máximo" },
  { codigoCabecera: "decretoSulfatos", valor: "Máximo" },
  { codigoCabecera: "decretoTemperatura", valor: "Máximo" },
  { codigoCabecera: "decretoTurbiedad", valor: "Máximo" },
  { codigoCabecera: "ecaAluminio", valor: "Máximo" },
  { codigoCabecera: "ecaCobre", valor: "Máximo" },
  { codigoCabecera: "ecaColiformesTermotolerantes", valor: "Máximo" },
  { codigoCabecera: "ecaColiformesTotales", valor: "Máximo" },
  { codigoCabecera: "ecaConductividad", valor: "Máximo" },
  { codigoCabecera: "ecaCromoTotal", valor: "Máximo" },
  { codigoCabecera: "ecaEscherichiaColi", valor: "Máximo" },
  { codigoCabecera: "ecaFormasParasitarias", valor: "Máximo" },
  { codigoCabecera: "ecaHierro", valor: "Máximo" },
  { codigoCabecera: "ecaManganeso", valor: "Máximo" },
  { codigoCabecera: "ecaNitratos", valor: "Máximo" },
  { codigoCabecera: "ecaNitritos", valor: "Máximo" },
  { codigoCabecera: "ecaOrganismosVidaLibre", valor: "Máximo" },
  { codigoCabecera: "ecaPh", valor: "Máximo" },
  { codigoCabecera: "ecaSulfatos", valor: "Máximo" },
  { codigoCabecera: "ecaTemperatura", valor: "Máximo" },
  { codigoCabecera: "ecaTurbiedad", valor: "Máximo" },
];

const resources = ["centros", "periodos", "reportes", "parametros", "usuarios"];
const actions = ["ver", "crear", "editar", "eliminar"];
const allPermissionNames = resources.flatMap(resource => actions.map(action => `${resource}.${action}`));

const roleDefinitions = [
  {
    name: "admin",
    description: "Acceso total al sistema",
    permissions: allPermissionNames,
  },
  {
    name: "editor",
    description: "Puede ver, crear y editar centros, periodos, reportes y parametros",
    permissions: resources
      .filter(resource => resource !== "usuarios")
      .flatMap(resource => ["ver", "crear", "editar"].map(action => `${resource}.${action}`)),
  },
  {
    name: "viewer",
    description: "Solo puede ver la informacion",
    permissions: resources.map(resource => `${resource}.ver`),
  },
];

async function seedRoles() {
  for (const name of allPermissionNames) {
    const [resource, action] = name.split(".");

    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: {
        name,
        description: `Permite ${action} en ${resource}`,
      },
    });
  }

  for (const roleDef of roleDefinitions) {
    const permissionsData = { connect: roleDef.permissions.map(name => ({ name })) };

    await prisma.role.upsert({
      where: { name: roleDef.name },
      update: {
        description: roleDef.description,
        permissions: { set: roleDef.permissions.map(name => ({ name })) },
      },
      create: {
        name: roleDef.name,
        description: roleDef.description,
        permissions: permissionsData,
      },
    });
  }

  console.log(`Permissions ready: ${allPermissionNames.length}`);
  console.log(`Roles ready: ${roleDefinitions.map(r => r.name).join(", ")}`);
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
      roles: { connect: { name: "admin" } },
    },
    create: {
      email: defaultUser.email,
      name: defaultUser.name,
      password: hashedPassword,
      emailVerified: true,
      roles: { connect: { name: "admin" } },
    },
  });

  console.log(`Default user ready: ${defaultUser.email} (admin)`);
}

// Los centros poblados ya no se siembran con datos de ejemplo: se cargan
// con datos reales desde Admin > Centros > Importar Excel
// (ver public/pvica_reporte_centrospoblados.xlsx).

async function seedParametros() {
  const validCodes = parametros.map(parametro => parametro.codigoCabecera);

  await prisma.parametro.deleteMany({
    where: {
      codigoCabecera: {
        notIn: validCodes,
      },
    },
  });

  let created = 0;
  let updated = 0;

  for (const parametro of parametros) {
    const existingParametro = await prisma.parametro.findFirst({
      where: { codigoCabecera: parametro.codigoCabecera },
    });

    if (existingParametro) {
      await prisma.parametro.update({
        where: { id: existingParametro.id },
        data: { valor: parametro.valor },
      });
      updated += 1;
      continue;
    }

    await prisma.parametro.create({
      data: parametro,
    });
    created += 1;
  }

  console.log(`Parametros ready: ${parametros.length} total, ${created} created, ${updated} updated`);
}

async function main() {
  await seedRoles();
  await seedDefaultUser();
  await seedParametros();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
