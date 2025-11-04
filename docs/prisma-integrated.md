## INSTALLAR 

npm install -D prisma
npm install @prisma/client

npx prisma init


## SCHEMA PRISMA 
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

```typescript
generator client {
  provider = "prisma-client"
  output   = "../app/generated/prisma"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}


model User {
  id            Int     @id @default(autoincrement())
  email         String  @unique
  emailVerified Boolean @default(false)
  password      String? // Ahora opcional (para usuarios OAuth)
  name          String?
  avatar        String?
  bio           String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones
  posts    Post[]
  accounts Account[] // Múltiples cuentas (GitHub, Google, etc.)

  @@map("users") // La tabla se llama "users" en la BD
}

model Account {
  id                Int    @id @default(autoincrement())
  userId            Int
  provider          String // "github", "google", "email"
  providerAccountId String // ID del proveedor (GitHub ID, Google ID, etc.)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts") // La tabla se llama "accounts" en la BD
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

## ENV

DATABASE_URL="file:./dev.db"


## GENERAR DIRECTORIO LIB/prisma.ts


```
import { PrismaClient } from "@prisma/client";


const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal || prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

```




Veo que estás intentando configurar la URL de la base de datos directamente en el archivo `prisma.config.ts` usando la función `env()`. Sin embargo, basándome en los documentos de conocimiento, **esto no es la forma correcta de hacerlo**.

## El problema

Según la [documentación de Prisma Config](https://www.prisma.io/docs/orm/reference/prisma-config-reference#using-environment-variables), cuando usas `prisma.config.ts`, las variables de entorno de los archivos `.env` **no se cargan automáticamente**. La función `env()` que estás usando en el `datasource` no carga las variables de entorno por sí misma.

## La solución correcta

Debes cargar las variables de entorno manualmente importando `dotenv/config` al inicio de tu archivo de configuración:

```typescript
import "dotenv/config";  // Añade esta línea al inicio
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

**Importante:** Asegúrate de instalar `dotenv` primero:

```bash
npm install dotenv
```

## Configuración para SQLite

En tu archivo `.env`, define la URL de conexión para SQLite:

```
DATABASE_URL="file:./dev.db"
```

Con estos cambios, tu configuración debería funcionar correctamente y Prisma podrá encontrar la variable `DATABASE_URL`.