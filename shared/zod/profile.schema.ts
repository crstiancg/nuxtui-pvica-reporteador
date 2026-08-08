import * as z from "zod";

export const ProfileSchema = z.object({
  username: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(20, "El nombre no debe superar los 20 caracteres"),
  avatar: z.string().optional(),
  bio: z
    .string()
    .max(500, "La descripcion no debe superar los 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export type ProfileSchemaType = z.infer<typeof ProfileSchema>;