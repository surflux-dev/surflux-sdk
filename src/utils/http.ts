import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import {
  SurfluxAPIError,
  SurfluxAuthenticationError,
  SurfluxNetworkError,
  SurfluxNotFoundError,
  SurfluxRateLimitError,
  SurfluxTimeoutError,
} from '../errors';

export async function httpRequest<T = unknown>(
  url: string,
  options: {
    apiKey: string;
    method?: string;
    body?: unknown;
    params?: Record<string, unknown>;
  }
): Promise<T> {
  const { apiKey, method = 'GET', body, params } = options;

  let finalUrl = url;

  if (url.includes('?')) {
    const urlObj = new URL(url);
    urlObj.searchParams.set('api-key', apiKey);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            urlObj.searchParams.delete(key);
            value.forEach((item) => {
              urlObj.searchParams.append(key, String(item));
            });
          } else if (typeof value === 'object') {
            urlObj.searchParams.set(key, JSON.stringify(value));
          } else {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            urlObj.searchParams.set(key, String(value));
          }
        }
      });
    }
    finalUrl = urlObj.toString();
  } else {
    const searchParams = new URLSearchParams();
    searchParams.set('api-key', apiKey);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              searchParams.append(key, String(item));
            });
          } else if (typeof value === 'object') {
            searchParams.set(key, JSON.stringify(value));
          } else {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            searchParams.set(key, String(value));
          }
        }
      });
    }

    const queryString = searchParams.toString();
    if (queryString) {
      finalUrl += `?${queryString}`;
    }
  }

  const config: AxiosRequestConfig = {
    method,
    url: finalUrl,
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  };

  try {
    const response = await axios.request<T>(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      const status = axiosError.response?.status;
      const statusText = axiosError.response?.statusText || 'Error';
      let errorMessage = `API error: ${status || 'Unknown'} ${statusText}`;

      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (errorData.message) {
          errorMessage = `API error: ${errorData.message}`;
        } else if (errorData.error) {
          errorMessage = `API error: ${errorData.error}`;
        }
      }

      // Throw specific error types based on status code
      if (status === 401 || status === 403) {
        throw new SurfluxAuthenticationError(errorMessage, url);
      } else if (status === 404) {
        throw new SurfluxNotFoundError(errorMessage, url);
      } else if (status === 429) {
        throw new SurfluxRateLimitError(errorMessage, url);
      } else if (status && status >= 500) {
        throw new SurfluxAPIError(errorMessage, status, statusText, url);
      } else {
        throw new SurfluxAPIError(errorMessage, status, statusText, url);
      }
    }

    // Handle network errors
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        throw new SurfluxNetworkError(`Network error: Unable to connect to API. ${error.message}`, error);
      }
      if (error.message.includes('timeout')) {
        throw new SurfluxTimeoutError(`Request timeout: The API request took too long to complete. ${error.message}`, error);
      }
    }

    throw error;
  }
}
