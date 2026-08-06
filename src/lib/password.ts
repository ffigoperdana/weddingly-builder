import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  if (storedHash.startsWith('scrypt$')) {
    const [, salt, expectedHex] = storedHash.split('$');
    if (!salt || !expectedHex) return false;

    const expected = Buffer.from(expectedHex, 'hex');
    const actual = (await scrypt(password, salt, expected.length)) as Buffer;

    return (
      expected.length === actual.length &&
      timingSafeEqual(expected, actual)
    );
  }

  // Backward compatibility for accounts created before the password upgrade.
  const legacyHash = createHash('sha256')
    .update(password, 'utf8')
    .digest('hex');
  const expected = Buffer.from(storedHash, 'utf8');
  const actual = Buffer.from(legacyHash, 'utf8');

  return (
    expected.length === actual.length && timingSafeEqual(expected, actual)
  );
}
