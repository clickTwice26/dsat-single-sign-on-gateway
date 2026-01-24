const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RequestOptions extends RequestInit {
    token?: string;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, headers, ...rest } = options;

    // Auto-detect token if not provided
    let authToken = token;
    if (!authToken && typeof window !== 'undefined') {
        authToken = localStorage.getItem("accessToken") || undefined;
        if (!authToken) {
            // Try getting from cookie
            const match = document.cookie.match(new RegExp('(^| )accessToken=([^;]+)'));
            if (match) authToken = match[2];
        }
    }

    const config: RequestInit = {
        ...rest,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
            ...headers,
        },
    };

    // If options.credentials is not set, default to "include" to send cookies
    if (!config.credentials) {
        config.credentials = "include";
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Handle 401 Unauthorized globally-ish (or let caller handle)
    if (response.status === 401 && typeof window !== 'undefined') {
        // Optional: Redirect to login if unauthorized and not potentially handling it locally
        // But for now, just throw the error so the AuthProvider can handle logic
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
    }

    // Return null for 204 No Content
    if (response.status === 204) {
        return null as T;
    }

    return response.json();
}

export const api = {
    get: <T>(endpoint: string, options?: RequestOptions) => apiRequest<T>(endpoint, { ...options, method: "GET" }),
    post: <T>(endpoint: string, body: any, options?: RequestOptions) => apiRequest<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body: any, options?: RequestOptions) => apiRequest<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),
    delete: <T>(endpoint: string, options?: RequestOptions) => apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};
