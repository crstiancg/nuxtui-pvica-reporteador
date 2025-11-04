import { loginSchema } from "#shared/zod/login.schema";

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, loginSchema.parse);

  if (email === "password@gmail.com" && password === "password") {
    await setUserSession(event, {
      user: {
        name: "password",
        email: "password@gmail.com",
      },
    });
    return {};
  }

  throw createError({
    statusCode: 401,
    message: "Bad credentials",
  });
});