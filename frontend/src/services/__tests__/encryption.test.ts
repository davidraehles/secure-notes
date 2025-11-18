/**
 * Unit tests for encryption service
 */

import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, hashPassword } from '../encryption';

describe('Encryption Service', () => {
  const testPassword = 'test-password-123';
  const testText = 'This is a test note with sensitive information.';

  it('should encrypt and decrypt text correctly', async () => {
    const encrypted = await encrypt(testText, testPassword);
    expect(encrypted).toBeTruthy();
    expect(encrypted).not.toBe(testText);

    const decrypted = await decrypt(encrypted, testPassword);
    expect(decrypted).toBe(testText);
  });

  it('should produce different encrypted output for same input', async () => {
    const encrypted1 = await encrypt(testText, testPassword);
    const encrypted2 = await encrypt(testText, testPassword);
    
    // Should be different due to random salt and IV
    expect(encrypted1).not.toBe(encrypted2);
    
    // But both should decrypt to the same value
    const decrypted1 = await decrypt(encrypted1, testPassword);
    const decrypted2 = await decrypt(encrypted2, testPassword);
    expect(decrypted1).toBe(testText);
    expect(decrypted2).toBe(testText);
  });

  it('should fail to decrypt with wrong password', async () => {
    const encrypted = await encrypt(testText, testPassword);
    
    await expect(decrypt(encrypted, 'wrong-password')).rejects.toThrow();
  });

  it('should hash password consistently', async () => {
    const hash1 = await hashPassword(testPassword);
    const hash2 = await hashPassword(testPassword);
    
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
  });

  it('should handle empty string', async () => {
    const encrypted = await encrypt('', testPassword);
    const decrypted = await decrypt(encrypted, testPassword);
    expect(decrypted).toBe('');
  });

  it('should handle long text', async () => {
    const longText = 'A'.repeat(10000);
    const encrypted = await encrypt(longText, testPassword);
    const decrypted = await decrypt(encrypted, testPassword);
    expect(decrypted).toBe(longText);
  });
});

