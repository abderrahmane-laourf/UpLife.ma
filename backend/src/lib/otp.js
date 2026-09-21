export function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isOtpExpired(expiresAt) {
  return new Date(expiresAt).getTime() <= Date.now();
}
