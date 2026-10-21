export function toPublicUser(user) {
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}
