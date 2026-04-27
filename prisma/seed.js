import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const defaultUser = {
  email: "password@gmail.com",
  name: "password",
  password: "password",
};

const centros = [
  {
    departamento: "MADRE DE DIOS",
    provincia: "TAMBOPATA",
    distrito: "LABERINTO - SANTO DOMINGO",
    codigoUbigeo: "1701040034",
  },
  {
    departamento: "MADRE DE DIOS",
    provincia: "TAMBOPATA",
    distrito: "TAMBOPATA -  CHONTA",
    codigoUbigeo: "1701010032",
  },
  {
    departamento: "MADRE DE DIOS",
    provincia: "TAMBOPATA",
    distrito: "LABERINTO - FLORIDA ALTA",
    codigoUbigeo: "1701040022",
  },
  {
    departamento: "MADRE DE DIOS",
    provincia: "TAMBOPATA",
    distrito: "LABERINTO -  AMARACAIRE",
    codigoUbigeo: "1701040009",
  },
  {
    departamento: "MADRE DE DIOS",
    provincia: "TAMBOPATA",
    distrito: "TAMBOPATA - IZUYAMA",
    codigoUbigeo: "1701010040",
  },
  {
    departamento: "MADRE DE DIOS",
    provincia: "TAMBOPATA",
    distrito: "TAMBOPATA - FITZCARRALD",
    codigoUbigeo: "1701010024",
  },
  {
    departamento: "MADRE DE DIOS",
    provincia: "TAMBOPATA",
    distrito: "LAS PIEDRAS - ALEGRIA",
    codigoUbigeo: "1701030019",
  },
  {
    departamento: "MADRE DE DIOS",
    provincia: "MANU",
    distrito: "HUEPETUHE - CHOQUE",
    codigoUbigeo: "1702040004",
  },
  {
    departamento: "MADRE DE DIOS",
    provincia: "TAHUAMANU",
    distrito: "IÑAPARI - BELGICA",
    codigoUbigeo: "1703010002",
  },
  {
    departamento: "MADRE DE DIOS",
    provincia: "TAHUAMANU",
    distrito: "IÑAPARI - VILLA PRIMAVERA",
    codigoUbigeo: "1703010004",
  },
  {
    departamento: "MADRE DE DIOS",
    provincia: "MANU",
    distrito: "HUEPETUHE - CAYCHIHUE BARRACA",
    codigoUbigeo: "1702040007",
  },
  {
    departamento: "MADRE DE DIOS",
    provincia: "MANU",
    distrito: "MADRE DE DIOS - DELTA 2",
    codigoUbigeo: "1702030022",
  },
  {
    departamento: "MADRE DE DIOS",
    provincia: "TAHUAMANU",
    distrito: "TAHUAMANU - LA NOVIA",
    codigoUbigeo: "1703030007",
  },
  {
    departamento: "MADRE DE DIOS",
    provincia: "TAMBOPATA",
    distrito: "TAMBOPATA - OTILIA",
    codigoUbigeo: "1701010005",
  },
  {
    departamento: "MADRE DE DIOS",
    provincia: "TAHUAMANU",
    distrito: "TAHUAMANU - SAN PEDRO",
    codigoUbigeo: "1703030005",
  },
  {
    departamento: "MADRE DE DIOS",
    provincia: "TAMBOPATA",
    distrito: "INAMBARI - PALMERA",
    codigoUbigeo: "1701020017",
  },
  {
    departamento: "MADRE DE DIOS",
    provincia: "TAMBOPATA",
    distrito: "INAMBARI - DOS DE MAYO",
    codigoUbigeo: "1701020015",
  },
  {
    departamento: "MADRE DE DIOS",
    provincia: "TAMBOPATA",
    distrito: "INAMBARI -  PUERTO MAZUKO",
    codigoUbigeo: "1701020016",
  },
];

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
  await seedDefaultUser();
  await seedCentros();
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
