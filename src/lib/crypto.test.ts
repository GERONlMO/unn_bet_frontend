import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchPublicKey, encryptData } from './crypto';
import { apiClient } from './api';

const mockEncode = vi.fn((str) => new Uint8Array([1, 2, 3]));
const originalTextEncoder = global.TextEncoder;
global.TextEncoder = class TextEncoder {
  encode = mockEncode;
};

global.window = {
  crypto: {
    subtle: {
      importKey: vi.fn().mockResolvedValue('mock-key'),
      encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(3)),
    },
  },
  atob: vi.fn((str) => 'decoded'),
  btoa: vi.fn((str) => 'encoded'),
};
vi.mock('./api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));
describe('crypto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should fetch and import public key', async () => {
    const mockPem = `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----`;
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { publicKey: mockPem } });
    const key = await fetchPublicKey();
    expect(apiClient.get).toHaveBeenCalledWith('/api/auth/public-key');
    expect(window.atob).toHaveBeenCalledWith('MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...');
    expect(window.crypto.subtle.importKey).toHaveBeenCalledWith(
      'spki',
      expect.any(ArrayBuffer),
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['encrypt']
    );
    expect(key).toBe('mock-key');
  });
  it('should encrypt data', async () => {
    const mockKey = {} as CryptoKey;
    const result = await encryptData(mockKey, 'test-data');
    expect(mockEncode).toHaveBeenCalledWith('test-data');
    expect(window.crypto.subtle.encrypt).toHaveBeenCalledWith(
      { name: 'RSA-OAEP' },
      mockKey,
      expect.any(Uint8Array)
    );
    expect(window.btoa).toHaveBeenCalled();
    expect(result).toBe('encoded');
  });
});