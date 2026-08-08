import bcrypt from "bcryptjs";
import { changePasswordSchema } from "#shared/zod/change-password.schema";
import prisma from "~~/lib/prisma";

export default eventHandler(async (event) => {
  const session = await requireAuthenticatedSession(event);

  const { currentPassword, newPassword } = await readValidatedBody(event, changePasswordSchema.parse);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, password: true },
  });

  if (!user?.password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tu cuenta no tiene una contraseña configurada",
    });
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "La contraseña actual es incorrecta",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return {};
});
