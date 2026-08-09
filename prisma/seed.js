import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const defaultUser = {
  email: "password@gmail.com",
  name: "password",
  password: "password",
};

// Limites Maximos Permisibles (LMP) segun D.S. N° 031-2010-SA
// (Reglamento de la Calidad del Agua para Consumo Humano, Tablas 1-3 y
// Art. 71 para cloro residual) y Estandares de Calidad Ambiental (ECA)
// Categoria 1 - Subcategoria A1 segun D.S. N° 004-2017-MINAM.
// Cuando un parametro no tiene LMP numerico normado en la fuente oficial
// (ej. es cualitativo "libre de" o relativo, como la temperatura ECA que
// se mide en variacion Δ3°C respecto a la media historica), se deja
// limiteMin/limiteMax en null y no se evalua cumplimiento para el.
const DECRETO_NORMA = "D.S. N° 031-2010-SA";
const ECA_NORMA = "D.S. N° 004-2017-MINAM (ECA Categoria 1 - A1)";

const parametros = [
  { codigoCabecera: "decretoAluminio", valor: "Máximo", limiteMax: 0.2, unidad: "mg/L", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoBacteriasColiformesFecales", valor: "Máximo", limiteMax: 0, unidad: "UFC/100mL", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoBacteriasColiformesTotales", valor: "Máximo", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoBacteriasHeterotroficas", valor: "Máximo", limiteMax: 500, unidad: "UFC/mL", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoCloro", valor: "Mínimo", limiteMin: 0.5, unidad: "mg/L", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoCobre", valor: "Máximo", limiteMax: 1.0, unidad: "mg/L", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoConductividad", valor: "Máximo", limiteMax: 2000, unidad: "µmhos/cm", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoCromoTotal", valor: "Máximo", limiteMax: 0.05, unidad: "mg/L", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoEColiNmp", valor: "Máximo", limiteMax: 0, unidad: "NMP/100mL", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoHierro", valor: "Máximo", limiteMax: 0.3, unidad: "mg/L", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoHuevosLarvasHelmintos", valor: "Máximo", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoManganeso", valor: "Máximo", limiteMax: 0.5, unidad: "mg/L", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoNitratos", valor: "Máximo", limiteMax: 50, unidad: "mg/L", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoNitritosExposicionCorta", valor: "Máximo", limiteMax: 3, unidad: "mg/L", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoOrganismosVidaLibre", valor: "Máximo", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoPh", valor: "Mínimo", limiteMin: 6.5, limiteMax: 8.0, unidad: "pH", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoSolidosTotalesDisueltos", valor: "Máximo", limiteMax: 1000, unidad: "mg/L", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoSulfatos", valor: "Máximo", limiteMax: 250, unidad: "mg/L", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoTemperatura", valor: "Máximo", norma: DECRETO_NORMA },
  { codigoCabecera: "decretoTurbiedad", valor: "Máximo", limiteMax: 5, unidad: "UNT", norma: DECRETO_NORMA },
  { codigoCabecera: "ecaAluminio", valor: "Máximo", limiteMax: 0.9, unidad: "mg/L", norma: ECA_NORMA },
  { codigoCabecera: "ecaCobre", valor: "Máximo", limiteMax: 2, unidad: "mg/L", norma: ECA_NORMA },
  { codigoCabecera: "ecaColiformesTermotolerantes", valor: "Máximo", limiteMax: 20, unidad: "NMP/100mL", norma: ECA_NORMA },
  { codigoCabecera: "ecaColiformesTotales", valor: "Máximo", limiteMax: 50, unidad: "NMP/100mL", norma: ECA_NORMA },
  { codigoCabecera: "ecaConductividad", valor: "Máximo", limiteMax: 1500, unidad: "µS/cm", norma: ECA_NORMA },
  { codigoCabecera: "ecaCromoTotal", valor: "Máximo", limiteMax: 0.05, unidad: "mg/L", norma: ECA_NORMA },
  { codigoCabecera: "ecaEscherichiaColi", valor: "Máximo", limiteMax: 0, unidad: "NMP/100mL", norma: ECA_NORMA },
  { codigoCabecera: "ecaFormasParasitarias", valor: "Máximo", limiteMax: 0, unidad: "N° Organismo/L", norma: ECA_NORMA },
  { codigoCabecera: "ecaHierro", valor: "Máximo", limiteMax: 0.3, unidad: "mg/L", norma: ECA_NORMA },
  { codigoCabecera: "ecaManganeso", valor: "Máximo", limiteMax: 0.4, unidad: "mg/L", norma: ECA_NORMA },
  { codigoCabecera: "ecaNitratos", valor: "Máximo", limiteMax: 50, unidad: "mg/L", norma: ECA_NORMA },
  { codigoCabecera: "ecaNitritos", valor: "Máximo", limiteMax: 3, unidad: "mg/L", norma: ECA_NORMA },
  { codigoCabecera: "ecaOrganismosVidaLibre", valor: "Máximo", limiteMax: 0, unidad: "N° Organismo/L", norma: ECA_NORMA },
  { codigoCabecera: "ecaPh", valor: "Máximo", limiteMin: 6.5, limiteMax: 8.5, unidad: "pH", norma: ECA_NORMA },
  { codigoCabecera: "ecaSulfatos", valor: "Máximo", limiteMax: 250, unidad: "mg/L", norma: ECA_NORMA },
  { codigoCabecera: "ecaTemperatura", valor: "Máximo", norma: "D.S. N° 004-2017-MINAM — limite relativo (Δ3°C), no evaluable por muestra" },
  { codigoCabecera: "ecaTurbiedad", valor: "Máximo", limiteMax: 5, unidad: "UNT", norma: ECA_NORMA },
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
        data: {
          valor: parametro.valor,
          limiteMin: parametro.limiteMin ?? null,
          limiteMax: parametro.limiteMax ?? null,
          unidad: parametro.unidad ?? null,
          norma: parametro.norma ?? null,
        },
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
