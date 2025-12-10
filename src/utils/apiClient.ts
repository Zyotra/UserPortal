export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: "include" as RequestCredentials, // Always include cookies
  };

  let response = await fetch(endpoint, config);

  // Handle 419 Token Expiry
  if (response.status === 419) {
    try {
      const refreshResponse = await fetch("http://localhost:5050/get-access-token", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        localStorage.setItem('accessToken', refreshData.accessToken);
        
        // Update the Authorization header with the new token
        const newHeaders = {
            ...config.headers,
            "Authorization": `Bearer ${refreshData.accessToken}`
        };

        // Retry the original request
        response = await fetch(endpoint, { ...config, headers: newHeaders });
      } else {
        // Refresh failed - logout
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      throw error;
    }
  }

  return response;
};
export default apiClient;