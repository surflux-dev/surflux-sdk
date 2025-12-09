import axios, { AxiosError, AxiosRequestConfig } from 'axios';

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
      let errorMessage = `${axiosError.response?.status || 'Unknown'} ${
        axiosError.response?.statusText || 'Error'
      }`;

      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }

      throw new Error(`API error: ${errorMessage}`);
    }
    throw error;
  }
}
