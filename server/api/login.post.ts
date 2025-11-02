import { loginSchema, type LoginSchemaType } from '#shared/zod/login.schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  console.log('Login attempt:', {body});

  const { success, data, error } = loginSchema.safeParse(body);

  if (!success) {
    // Handle validation errors
    return createError({ statusCode: 400, statusMessage: 'Invalid payload', data: error });
  }

  // Proceed with login logic
  return { success: true, message: 'Login successful' };
})