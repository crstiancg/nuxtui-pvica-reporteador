import { loginSchema, type LoginSchemaType } from '#shared/zod/login.schema' 
import jwt from 'jsonwebtoken';
export default defineEventHandler(async (event) => {

  const { apiSecret, public: { baseApi } } = useRuntimeConfig();

  const body = await readBody(event);
  
  console.log('Login attempt:', {body});

  const { success, data, error } = loginSchema.safeParse(body);
  
  
  
  if (!success) {
    // Handle validation errors
    return createError({ statusCode: 400, statusMessage: 'Invalid payload'});
  }

  const token = jwt.sign({ email: data.email, baseApi }, apiSecret, { expiresIn: '1h' });

  setCookie(event, 'auth_token', token, {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
    path: '/',
  });


  // Proceed with login logic
  // return { success: true, message: 'Login successful', token };

  return { message: 'Login successful', user: { email: data.email, token } };
})