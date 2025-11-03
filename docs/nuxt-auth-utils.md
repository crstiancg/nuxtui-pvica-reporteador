# Nuxt Auth Utils

## ¿Qué es nuxt-auth-utils?

**nuxt-auth-utils** es un módulo para Nuxt que facilita la gestión de autenticación y sesiones de usuario, tanto en el cliente como en el servidor. Utiliza cookies seguras y cifradas para almacenar la sesión, por lo que no necesitas una base de datos solo para manejar sesiones. Además, provee utilidades y composables para saber si un usuario está autenticado y proteger rutas fácilmente [Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication).

## Ejemplo básico de implementación: login, logout y ruta protegida

### 1. Instalación

```bash
npx nuxt module add auth-utils
```

Esto agrega el módulo a tu proyecto y lo configura automáticamente.

### 2. Configura la clave de cifrado en `.env`

```env
NUXT_SESSION_PASSWORD=a-random-password-with-at-least-32-characters
```

### 3. Ruta de login (API)

Crea el archivo `server/api/login.post.ts`:

```ts
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse);

  if (email === "[email protected]" && password === "iamtheadmin") {
    await setUserSession(event, {
      user: { name: "John Doe" },
    });
    return {};
  }
  throw createError({ statusCode: 401, message: "Bad credentials" });
});
```

[Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication)

### 4. Página de login

Crea `app/pages/login.vue`:

```vue
<script setup lang="ts">
const { loggedIn, user, fetch: refreshSession } = useUserSession();
const credentials = reactive({ email: "", password: "" });

async function login() {
  try {
    await $fetch("/api/login", { method: "POST", body: credentials });
    await refreshSession();
    await navigateTo("/");
  } catch {
    alert("Bad credentials");
  }
}
</script>

<template>
  <form @submit.prevent="login">
    <input
      v-model="credentials.email"
      type="email"
      placeholder="Email"
    />
    <input
      v-model="credentials.password"
      type="password"
      placeholder="Password"
    />
    <button type="submit">Login</button>
  </form>
</template>
```

[Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication)

### 5. Middleware para proteger rutas

Crea `app/middleware/authenticated.ts`:

```ts
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession();
  if (!loggedIn.value) {
    return navigateTo("/login");
  }
});
```

[Protect App Routes](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication#protect-app-routes)

### 6. Página protegida (por ejemplo, Home)

```vue
<script setup lang="ts">
definePageMeta({ middleware: ["authenticated"] });

const { user, clear: clearSession } = useUserSession();

async function logout() {
  await clearSession();
  await navigateTo("/login");
}
</script>

<template>
  <div>
    <h1>Welcome {{ user.name }}</h1>
    <button @click="logout">Logout</button>
  </div>
</template>
```

[Home Page](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication#home-page)

---

**Resumen:**

- Usas `useUserSession()` para saber si el usuario está autenticado.
- El login se hace llamando a la API y refrescando la sesión.
- El logout se hace con `clearSession()`.
- Proteges rutas usando middleware y `definePageMeta`.

¡Así puedes tener autenticación básica y rutas protegidas en Nuxt de forma sencilla!

Claro, aquí tienes un tutorial paso a paso para configurar **nuxt-auth-utils** en Nuxt 4, incluyendo ejemplos de login, API, y una ruta protegida. También te explico el tema de JWT según la documentación oficial.

---

## 1. Instalación de nuxt-auth-utils

Ejecuta en tu terminal:

```bash
npx nuxt module add auth-utils
```

Esto agregará el módulo a la sección `modules` de tu `nuxt.config.ts` automáticamente.  
[Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication)

---

## 2. Configuración de la clave de cifrado de cookies

Agrega la variable de entorno en tu archivo `.env`:

```
NUXT_SESSION_PASSWORD=a-random-password-with-at-least-32-characters
```

Esta clave es usada para cifrar las cookies de sesión.  
[Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication)

---

## 3. Crear la ruta de login en el servidor

Crea el archivo `server/api/login.post.ts`:

```ts
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse);

  if (email === "[email protected]" && password === "iamtheadmin") {
    // Establece la sesión del usuario en la cookie
    await setUserSession(event, {
      user: {
        name: "John Doe",
      },
    });
    return {};
  }
  throw createError({
    statusCode: 401,
    message: "Bad credentials",
  });
});
```

Asegúrate de instalar la dependencia `zod`:

```bash
npm i zod
```

[Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication)

---

## 4. Crear la página de login

Crea el archivo `app/pages/login.vue`:

```vue
<script setup lang="ts">
const { loggedIn, user, fetch: refreshSession } = useUserSession();
const credentials = reactive({
  email: "",
  password: "",
});
async function login() {
  try {
    await $fetch("/api/login", {
      method: "POST",
      body: credentials,
    });
    // Refresca la sesión y redirige al home
    await refreshSession();
    await navigateTo("/");
  } catch {
    alert("Bad credentials");
  }
}
</script>

<template>
  <form @submit.prevent="login">
    <input
      v-model="credentials.email"
      type="email"
      placeholder="Email"
    />
    <input
      v-model="credentials.password"
      type="password"
      placeholder="Password"
    />
    <button type="submit">Login</button>
  </form>
</template>
```

[Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication)

---

## 5. Proteger rutas con middleware

Crea el archivo `app/middleware/authenticated.ts`:

```ts
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession();
  if (!loggedIn.value) {
    return navigateTo("/login");
  }
});
```

[Protect App Routes](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication#protect-app-routes)

---

## 6. Crear una página protegida (dashboard)

Crea el archivo `app/pages/dashboard.vue`:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ["authenticated"],
});
const { user, clear: clearSession } = useUserSession();
async function logout() {
  await clearSession();
  await navigateTo("/login");
}
</script>

<template>
  <div>
    <h1>Bienvenido {{ user.name }}</h1>
    <button @click="logout">Logout</button>
  </div>
</template>
```

[Home Page](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication#home-page)

---

## 7. ¿Utiliza JWT?

**nuxt-auth-utils** NO utiliza JWT por defecto. Utiliza cookies selladas y cifradas para almacenar la sesión del usuario en el servidor, lo que simplifica la gestión y aumenta la seguridad en aplicaciones full-stack con Nuxt.  
[Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication)

---

### Resumen

- Instala y configura nuxt-auth-utils.
- Crea la API de login y la página de login.
- Protege rutas con middleware.
- No necesitas JWT, ya que la sesión se maneja con cookies cifradas automáticamente.

Si necesitas más detalles sobre personalización o integración con bases de datos, revisa la [receta oficial](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication).