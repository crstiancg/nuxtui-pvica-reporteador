import * as z from 'zod'

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z.string().min(6, 'Debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña')
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  })

export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>
