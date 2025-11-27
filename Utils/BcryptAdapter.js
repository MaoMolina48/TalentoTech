const crypto = require('crypto');

const SALT_LENGTH = 16;

const hash = async (value, rounds = 10) => {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(value, salt, rounds * 1000, 64, 'sha512').toString('hex');
  return `${salt}$${derivedKey}`;
};

const compare = async (value, hashedValue) => {
  if (!hashedValue) return false;
  const [salt, storedHash] = hashedValue.split('$');
  if (!salt || !storedHash) return false;
  const derivedKey = crypto.pbkdf2Sync(value, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(derivedKey, 'hex'));
};

module.exports = { hash, compare };
