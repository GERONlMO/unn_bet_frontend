import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, API_URL } from './api';
describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });
  it('should have correct baseURL', () => {
    expect(apiClient.defaults.baseURL).toBe(API_URL);
  });
  it('should add Authorization header if token exists', async () => {
    localStorage.setItem('token', 'test-token');

    const config = { headers: {} as any };
    const interceptor = (apiClient.interceptors.request as any).handlers[0].fulfilled;
    const result = await interceptor(config);
    expect(result.headers.Authorization).toBe('Bearer test-token');
  });
  it('should not add Authorization header if token does not exist', async () => {
    const config = { headers: {} as any };
    const interceptor = (apiClient.interceptors.request as any).handlers[0].fulfilled;
    const result = await interceptor(config);
    expect(result.headers.Authorization).toBeUndefined();
  });
  it('should return response directly in response interceptor', async () => {
    const interceptor = (apiClient.interceptors.response as any).handlers[0].fulfilled;
    const response = { data: 'test' };
    expect(await interceptor(response)).toBe(response);
  });
  it('should remove token on 401 response', async () => {
    localStorage.setItem('token', 'test-token');
    const interceptor = (apiClient.interceptors.response as any).handlers[0].rejected;
    const error = { response: { status: 401 } };
    try {
      await interceptor(error);
    } catch (e) {
      expect(e).toBe(error);
    }
    expect(localStorage.getItem('token')).toBeNull();
  });
  it('should remove token on 403 response', async () => {
    localStorage.setItem('token', 'test-token');
    const interceptor = (apiClient.interceptors.response as any).handlers[0].rejected;
    const error = { response: { status: 403 } };
    try {
      await interceptor(error);
    } catch (e) {
      expect(e).toBe(error);
    }
    expect(localStorage.getItem('token')).toBeNull();
  });
  it('should reject error on other statuses without removing token', async () => {
    localStorage.setItem('token', 'test-token');
    const interceptor = (apiClient.interceptors.response as any).handlers[0].rejected;
    const error = { response: { status: 500 } };
    try {
      await interceptor(error);
    } catch (e) {
      expect(e).toBe(error);
    }
    expect(localStorage.getItem('token')).toBe('test-token');
  });
});