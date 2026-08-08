import prisma from "~~/lib/prisma";

export default eventHandler(async (event) => {
  const session = await requireAuthenticatedSession(event);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      avatar: true,
      bio: true,
      roles: { select: { id: true, name: true } },
    },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  return {
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    roles: user.roles,
  };
});