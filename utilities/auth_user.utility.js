function getAuthUserId(req) {
  const user = req?.user;
  if (!user) return undefined;
  return user.userId ?? user.id ?? user._id ?? undefined;
}

module.exports = { getAuthUserId };
