const crypto = require('crypto');

const SALT_LENGTH = 16;
const LEGACY_BCRYPT_PATTERN = /^\$2[aby]\$/;

let bcryptModulePromise;
const loadBcrypt = () => {
  if (!bcryptModulePromise) {
    bcryptModulePromise = import('bcryptjs').then((mod) => mod.default || mod).catch(() => null);
  }
  return bcryptModulePromise;
};

const hash = async (value, rounds = 10) => {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(value, salt, rounds * 1000, 64, 'sha512').toString('hex');
  return `${salt}$${derivedKey}`;
};

const compare = async (value, hashedValue) => {
  if (!hashedValue) return false;

  if (LEGACY_BCRYPT_PATTERN.test(hashedValue)) {
    const bcrypt = await loadBcrypt();
    if (!bcrypt) return false;
    return bcrypt.compare(value, hashedValue);
  }

  const [salt, storedHash] = hashedValue.split('$');
  if (!salt || !storedHash) return false;
  const derivedKey = crypto.pbkdf2Sync(value, salt, 10000, 64, 'sha512').toString('hex');
  const storedBuffer = Buffer.from(storedHash, 'hex');
  const derivedBuffer = Buffer.from(derivedKey, 'hex');
  if (storedBuffer.length !== derivedBuffer.length) return false;
  return crypto.timingSafeEqual(storedBuffer, derivedBuffer);
};

module.exports = { hash, compare };
