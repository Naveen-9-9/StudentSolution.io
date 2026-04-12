export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("Authentication required. Please log in to access this feature.");
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    throw new Error("Refresh token expired");
  }

  const data = await response.json();
  if (data.success && data.data) {
    const { accessToken, refreshToken: newRefreshToken } = data.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    return accessToken;
  }

  throw new Error("Failed to refresh token");
}

// Standard fetch wrapper that automatically adds the Authorization header
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchApi(endpoint: string, options: any = {}): Promise<any> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const headers = new Headers(options.headers || undefined);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let body = options.body;
  if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof Blob)) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    body
  });

  // Handle 401 Unauthorized - Attempt Token Refresh
  if (response.status === 401 && typeof window !== "undefined") {
    // If we don't even have a refresh token, don't attempt to refresh
    if (!localStorage.getItem("refreshToken")) {
      throw new Error("Login required to access this feature.");
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        onTokenRefreshed(newToken);
      } catch (error) {
        isRefreshing = false;
        // Notify subscribers of failure (optional, but retry will fail anyway)
        window.dispatchEvent(new CustomEvent("auth:logout"));
        throw error;
      }
    }

    // Wait for the token to be refreshed
    const retryOriginalRequest = new Promise((resolve) => {
      subscribeTokenRefresh((token) => {
        const newOptions = { ...options };
        const newHeaders = new Headers(newOptions.headers || undefined);
        newHeaders.set("Authorization", `Bearer ${token}`);
        if (newOptions.body && !newHeaders.has("Content-Type")) {
           newHeaders.set("Content-Type", "application/json");
        }
        newOptions.headers = newHeaders;
        resolve(fetch(`${API_URL}${endpoint}`, newOptions).then(res => res.json()));
      });
    });

    return retryOriginalRequest;
  }

  if (!response.ok) {
    let errorMsg = "Something went wrong";
    try {
      const data = await response.json();
      errorMsg = data.error || data.message || errorMsg;
    } catch {
      errorMsg = response.statusText || `HTTP ${response.status}`;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
