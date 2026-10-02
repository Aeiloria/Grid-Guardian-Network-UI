/**
 * Local Storage Intercept & PIN Cryptography Layer
 * Advanced Encryption Standard with Galois/Counter Mode (AES-GCM)
 */

async function deriveSymmetricKey(passphraseToken: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const rawKeyData = encoder.encode(passphraseToken);
  const hashBuffer = await crypto.subtle.digest('SHA-256', rawKeyData);
  
  return await crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptPayload(plainText: string, secretKeyToken: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataToEncrypt = encoder.encode(plainText);
  const key = await deriveSymmetricKey(secretKeyToken);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    dataToEncrypt
  );

  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
  const cipherHex = Array.from(new Uint8Array(encryptedBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${ivHex}:${cipherHex}`;
}

export async function decryptPayload(compoundHexString: string, secretKeyToken: string): Promise<string> {
  const [ivHex, cipherHex] = compoundHexString.split(':');
  if (!ivHex || !cipherHex) throw new Error('Invalid stored database encryption envelope format.');

  const ivMatches = ivHex.match(/.{1,2}/g);
  const cipherMatches = cipherHex.match(/.{1,2}/g);
  if (!ivMatches || !cipherMatches) throw new Error('Malformed hexadecimal payload segments.');

  const iv = new Uint8Array(ivMatches.map(byte => parseInt(byte, 16)));
  const cipherData = new Uint8Array(cipherMatches.map(byte => parseInt(byte, 16)));
  const key = await deriveSymmetricKey(secretKeyToken);
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    cipherData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}
