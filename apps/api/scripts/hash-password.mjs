// Generates the bcrypt hash for AUTH_PASSWORD_HASH.
// Usage (from apps/api): node scripts/hash-password.mjs <password>
import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.mjs <password>');
  process.exit(1);
}

console.log(bcrypt.hashSync(password, 10));
