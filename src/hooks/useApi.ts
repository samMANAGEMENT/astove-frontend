import { useState, useCallback } from 'react';
import api from '../lib/axios';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useApi = (options: UseApiOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const execute = useCallback(async (
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    requestData?: any
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api[method](url, requestData);
      const responseData = response.data;

      setData(responseData);
      options.onSuccess?.(responseData);

      return responseData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error en la petición';
      setError(errorMessage);
      options.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const get = useCallback((url: string) => execute('get', url), [execute]);
  const post = useCallback((url: string, data?: any) => execute('post', url, data), [execute]);
  const put = useCallback((url: string, data?: any) => execute('put', url, data), [execute]);
  const del = useCallback((url: string) => execute('delete', url), [execute]);
  const patch = useCallback((url: string, data?: any) => execute('patch', url, data), [execute]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearData = useCallback(() => {
    setData(null);
  }, []);

  return {
    isLoading,
    error,
    data,
    get,
    post,
    put,
    delete: del,
    patch,
    clearError,
    clearData,
  };
}; 