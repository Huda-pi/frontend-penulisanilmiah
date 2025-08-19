

import { API_BASE_URL } from '../constants';

const request = async <T,>(url: string, options: RequestInit = {}): Promise<T> => {
    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for sending cookies
    };

    const mergedOptions: RequestInit = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, mergedOptions);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Terjadi kesalahan yang tidak diketahui' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        // Handle cases with no response body (e.g., 204 No Content)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null as T;
        }

        return await response.json() as T;
    } catch (error) {
        console.error(`API request failed: ${url}`, error);
        throw error;
    }
};

export const apiService = {
    get: <T,>(url: string) => request<T>(url, { method: 'GET' }),
    post: <T,>(url: string, data: any) => request<T>(url, { method: 'POST', body: JSON.stringify(data) }),
    put: <T,>(url: string, data?: any) => request<T>(url, { method: 'PUT', body: data ? JSON.stringify(data) : null }),
    delete: <T,>(url: string) => request<T>(url, { method: 'DELETE' }),
};