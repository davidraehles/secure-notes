/**
 * Client-side encryption service using Web Crypto API
 * Uses AES-GCM for encryption and PBKDF2 for key derivation
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;

/**
 * Derive a cryptographic key from a password using PBKDF2
 */
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a random salt
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Generate a random IV
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Encrypt text using AES-GCM
 * Returns base64-encoded string: salt + iv + encryptedData
 */
export async function encrypt(
  text: string,
  password: string
): Promise<string> {
  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKey(password, salt);

  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv,
    },
    key,
    data
  );

  // Combine salt + iv + encryptedData
  const combined = new Uint8Array(
    salt.length + iv.length + encryptedData.byteLength
  );
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt base64-encoded encrypted data
 * Expects format: salt + iv + encryptedData
 */
export async function decrypt(
  encryptedBase64: string,
  password: string
): Promise<string> {
  // Decode base64
  const combined = Uint8Array.from(
    atob(encryptedBase64),
    (c) => c.charCodeAt(0)
  );

  // Extract salt, iv, and encrypted data
  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const encryptedData = combined.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(password, salt);

  const decryptedData = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: iv,
    },
    key,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}

/**
 * Hash password for authentication (client-side verification)
 * Uses SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

