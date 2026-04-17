export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

function subscribeTokenRefresh(cb: () => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed() {
  refreshSubscribers.map((cb) => cb());
  refreshSubscribers = [];
}

async function refreshAccessToken() {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include" // Send refreshToken cookie
  });

  if (!response.ok) {
    throw new Error("Session expired. Please log in again.");
  }

  return response.json();
}

// Standard fetch wrapper that automatically uses secure cookies
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchApi(endpoint: string, options: any = {}): Promise<any> {
  const headers = new Headers(options.headers || undefined);

  let body = options.body;
  if (body) {
    if (typeof body === "object" && !(body instanceof FormData) && !(body instanceof Blob)) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(body);
    } else if (typeof body === "string") {
      if (!headers.has("Content-Type") && (body.startsWith("{") || body.startsWith("["))) {
        headers.set("Content-Type", "application/json");
      }
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    body,
    credentials: "include" // Critical: Send and receive cookies
  });

  // Handle 401 Unauthorized - Attempt Silent Token Refresh
  // Note: We skip refresh for core auth endpoints to avoid loops and race conditions
  const authEndpoints = ["/auth/login", "/auth/register", "/auth/exchange", "/auth/logout", "/auth/refresh"];
  if (response.status === 401 && typeof window !== "undefined" && !authEndpoints.includes(endpoint)) {
    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh(() => {
          resolve(fetchApi(endpoint, options));
        });
      });
    }

    isRefreshing = true;

    try {
      await refreshAccessToken();
      isRefreshing = false;
      onTokenRefreshed();
      return fetchApi(endpoint, options);
    } catch (error) {
      isRefreshing = false;
      // If refresh fails, notify the app to logout
      window.dispatchEvent(new CustomEvent("auth:logout"));

      // If this was a background checks, fail silently to guest mode
      if (endpoint === "/auth/me") {
        return { success: false, data: null, error: "Not authenticated" };
      }
      throw error;
    }
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
