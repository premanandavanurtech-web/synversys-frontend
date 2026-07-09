// src/context/AuthContexts.jsx - Fixed Race Condition

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://synversys-backend-dxx1.onrender.com/api/v1";

// Clear all auth data from storage
const clearAuthData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userType");
  localStorage.removeItem("rememberMe");
  localStorage.removeItem("rememberedEmail");
  sessionStorage.removeItem("accessToken");

  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
};

const isPublicPath = (pathname) => (
  pathname === "/" ||
  pathname === "/login" ||
  pathname === "/forgot-password" ||
  pathname.startsWith("/reset-password")
);

const redirectToLogin = () => {
  const { pathname, search } = window.location;

  if (isPublicPath(pathname)) {
    return;
  }

  if (!isPublicPath(pathname)) {
    sessionStorage.setItem("redirectAfterLogin", `${pathname}${search}`);
  }

  window.location.replace("/login");
};

// Validate token format
const isValidToken = (token) => {
  if (!token || token === "undefined" || token === "null" || token.length <= 20) {
    return false;
  }

  const [, payload] = token.split(".");
  if (!payload) {
    return false;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(
      window.atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=")),
    );

    if (decodedPayload.exp && decodedPayload.exp * 1000 <= Date.now()) {
      return false;
    }

    return true;
  } catch (error) {
    console.warn("Invalid auth token payload:", error);
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [userType, setUserType] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const initializeAuth = useCallback(() => {
    console.log("Initializing authentication...");
    const storedUser = localStorage.getItem("user");
    const storedToken =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    const storedUserType = localStorage.getItem("userType");

    const isValidUser =
      storedUser && storedUser !== "undefined" && storedUser !== "null";
    const isValidTokenValue = isValidToken(storedToken);

    if (isValidUser && isValidTokenValue) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log(
          "Found stored user:",
          parsedUser.email,
          "Role:",
          parsedUser.role,
        );
        setUser(parsedUser);
        setToken(storedToken);
        setUserType(storedUserType || parsedUser.role);
      } catch (parseError) {
        console.error("Error parsing user data:", parseError);
        clearAuthData();
      }
    } else {
      console.log("No stored auth found");
      clearAuthData();
    }
    setLoading(false);
    setInitialized(true);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Listen for auth:expired event from API interceptor
  useEffect(() => {
    const handleExpired = () => {
      console.log("[Auth] Session expired — clearing React state");
      clearAuthData();
      setToken(null);
      setUser(null);
      setUserType(null);
      redirectToLogin();
    };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, []);

  const login = async (email, password) => {
    console.log("Attempting login for:", email);

    // Clear any existing auth state before login attempt
    // This prevents stale state issues
    clearAuthData();
    setToken(null);
    setUser(null);
    setUserType(null);

    try {
      const tempApi = axios.create({
        baseURL: API_BASE_URL,
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
        timeout: 30000,
      });

      const response = await tempApi.post("/auth/login", { email, password });

      console.log("Login response status:", response.status);

      if (
        response.data.success &&
        response.data.user &&
        response.data.accessToken
      ) {
        const userData = response.data.user;
        const accessToken = response.data.accessToken;

        console.log("Backend user role:", userData.role);

        let transformedUser = {};
        let userRoleType = "";
        let redirectPath = "/dashboard";

        const backendRole = (userData.role || "").toLowerCase();

        if (backendRole === "super_admin") {
          transformedUser = {
            id: userData.id || userData._id,
            _id: userData.id || userData._id,
            email: userData.email,
            role: "super_admin",
            backendRole: userData.role,
            name: userData.name || "Super Admin",
            permissions: userData.permissions || [],
          };
          userRoleType = "super_admin";
          redirectPath = "/dashboard";
        } else if (backendRole === "admin") {
          transformedUser = {
            id: userData.id || userData._id,
            _id: userData.id || userData._id,
            email: userData.email,
            role: "admin",
            backendRole: userData.role,
            name: userData.customerName || userData.name || "Admin",
            customerName: userData.customerName,
            membershipPlan: userData.membershipPlan,
            daysRemaining: userData.daysRemaining,
            usagePercentage: userData.usagePercentage,
            licenseLimit: userData.licenseLimit,
            usersUsed: userData.usersUsed,
            phone: userData.phone,
            website: userData.website,
            address: userData.address,
            settings: userData.settings,
          };
          userRoleType = "admin";
          redirectPath = "/dashboard";
        } else if (backendRole === "team") {
          transformedUser = {
            id: userData.id || userData._id,
            _id: userData.id || userData._id,
            email: userData.email,
            role: "team",
            backendRole: userData.role,
            name:
              userData.fullName ||
              `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
              userData.name ||
              "Team Member",
            firstName: userData.firstName,
            lastName: userData.lastName,
            fullName: userData.fullName,
            initials: userData.initials,
            department: userData.department,
            location: userData.location,
            adminId: userData.adminId,
            teamRole: userData.teamRole,
            roleDisplay: userData.roleDisplay,
            stats: userData.stats,
            permissions: userData.permissions || [],
          };
          userRoleType = "team";
          redirectPath = "/team";
        } else {
          transformedUser = {
            id: userData.id || userData._id,
            _id: userData.id || userData._id,
            email: userData.email,
            role: userData.role || "team",
            backendRole: userData.role,
            name: userData.name || userData.fullName || "User",
          };
          userRoleType = userData.role || "team";
          redirectPath = userData.role === "team" ? "/team" : "/dashboard";
        }

        // Store auth data
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(transformedUser));
        localStorage.setItem("userType", userRoleType);

        // Update state
        setToken(accessToken);
        setUser(transformedUser);
        setUserType(userRoleType);

        console.log(
          "Login successful! Role:",
          userRoleType,
          "Redirecting to:",
          redirectPath,
        );

        return {
          success: true,
          role: userRoleType,
          userType: userRoleType,
          user: transformedUser,
          token: accessToken,
          redirectPath,
          message: response.data.message || "Login successful",
        };
      }

      return {
        success: false,
        error: response.data.message || "Invalid response from server",
      };
    } catch (error) {
      console.error("Login error:", error);

      if (error.code === "ECONNABORTED" || error.message === "Network Error") {
        return {
          success: false,
          error: "Network error. Please check your internet connection.",
        };
      }

      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          return {
            success: false,
            error: "Invalid email or password. Please try again.",
          };
        } else if (status === 429) {
          return {
            success: false,
            error: "Too many login attempts. Please try again later.",
          };
        } else if (status === 500) {
          return {
            success: false,
            error: "Server error. Please try again later.",
          };
        }
        return {
          success: false,
          error:
            error.response.data?.message ||
            error.response.data?.error ||
            "Login failed. Please try again.",
        };
      } else if (error.request) {
        return {
          success: false,
          error:
            "Cannot connect to server. Please check if the backend is running.",
        };
      } else {
        return {
          success: false,
          error: "An unexpected error occurred. Please try again.",
        };
      }
    }
  };

  const forgotPassword = async (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/forgot-password`,
        { email },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          // timeout: 45000,
        },
      );

      if (response.data.success) {
        return {
          success: true,
          message:
            response.data.message || "Password reset link sent to your email.",
        };
      } else {
        return {
          success: false,
          error:
            response.data.message ||
            "Unable to process request. Please try again.",
        };
      }
    } catch (error) {
      console.error("Forgot password error:", error.message);

      if (error.code === "ECONNABORTED") {
        return {
          success: false,
          error:
            "The reset email service is taking too long to respond. Please try again in a minute.",
        };
      }

      if (error.response?.status === 429) {
        return {
          success: false,
          error:
            "Too many requests. Please wait a few minutes before trying again.",
        };
      }

      if (error.response?.status === 404) {
        return {
          success: false,
          error: "Email not found. Please check and try again.",
        };
      }

      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Unable to connect to server. Please try again.",
      };
    }
  };

  const resetPassword = async (resetToken, newPassword, confirmPassword) => {
    console.log("Processing password reset");

    if (newPassword !== confirmPassword) {
      return { success: false, error: "Passwords do not match" };
    }
    if (newPassword.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters long",
      };
    }
    if (!/[A-Z]/.test(newPassword)) {
      return {
        success: false,
        error: "Password must contain at least one uppercase letter",
      };
    }
    if (!/[a-z]/.test(newPassword)) {
      return {
        success: false,
        error: "Password must contain at least one lowercase letter",
      };
    }
    if (!/[0-9]/.test(newPassword)) {
      return {
        success: false,
        error: "Password must contain at least one number",
      };
    }
    if (!/[@$!%*?&]/.test(newPassword)) {
      return {
        success: false,
        error: "Password must contain at least one special character (@$!%*?&)",
      };
    }
    if (!/^[A-Za-z\d@$!%*?&]+$/.test(newPassword)) {
      return {
        success: false,
        error: "Password can only contain letters, numbers, and @$!%*?&",
      };
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/reset-password`,
        { token: resetToken, newPassword, confirmPassword },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          timeout: 15000,
        },
      );

      if (response.data.success) {
        return {
          success: true,
          message:
            response.data.message ||
            "Password has been reset successfully. Please login with your new password.",
        };
      } else {
        return {
          success: false,
          error:
            response.data.message ||
            "Failed to reset password. Please request a new reset link.",
        };
      }
    } catch (error) {
      console.error("Reset password error:", error);
      if (error.response) {
        const status = error.response.status;
        if (status === 400 || status === 401) {
          return {
            success: false,
            error:
              "Invalid or expired reset token. Please request a new password reset link.",
          };
        } else {
          return {
            success: false,
            error: "Unable to reset password. Please request a new reset link.",
          };
        }
      } else if (error.request) {
        return {
          success: false,
          error:
            "Unable to connect to server. Please check your connection and try again.",
        };
      } else {
        return {
          success: false,
          error: "An unexpected error occurred. Please try again.",
        };
      }
    }
  };

  const logout = useCallback(async () => {
    console.log("Logging out...");
    try {
      const currentToken =
        token ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");
      if (isValidToken(currentToken)) {
        await axios.post(
          `${API_BASE_URL}/auth/logout`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentToken}`,
            },
            withCredentials: true,
            timeout: 10000,
          },
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthData();
      setToken(null);
      setUser(null);
      setUserType(null);
      console.log("Logout complete");
    }
  }, [token]);

  const expireSessionDueToInactivity = useCallback(() => {
    const currentToken =
      token ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    if (isValidToken(currentToken)) {
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        credentials: "include",
        body: "{}",
        keepalive: true,
      }).catch((error) => {
        console.warn("Inactivity logout request failed:", error);
      });
    }

    clearAuthData();
    sessionStorage.setItem(
      "authExpiredMessage",
      "Your session expired due to inactivity.",
    );
    setToken(null);
    setUser(null);
    setUserType(null);
    window.location.replace("/login");
  }, [token]);

  const getUserRole = () => user?.role || null;
  const getUserType = () => userType;
  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (roles) => roles.includes(user?.role);
  const isSuperAdmin = () => user?.role === "super_admin";
  const isAdmin = () => user?.role === "admin";
  const isTeam = () => user?.role === "team";

  const isAuthenticated = useMemo(() => {
    const authStatus = !!user && isValidToken(token);
    return authStatus;
  }, [user, token]);

  const tryRefreshAccessToken = useCallback(async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh-token`,
        {},
        {
          withCredentials: true,
          timeout: 10000,
        },
      );

      if (response.data?.success && response.data?.accessToken) {
        const newToken = response.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        localStorage.setItem("token", newToken);
        sessionStorage.removeItem("accessToken");
        setToken(newToken);
        return newToken;
      }
    } catch (error) {
      console.warn(
        "Token refresh failed:",
        error.response?.data?.message || error.message,
      );
    }
    return null;
  }, []);

  const authRequest = useCallback(
    async (method, url, data = null, customConfig = {}) => {
      let currentToken = token;
      if (!isValidToken(currentToken)) {
        currentToken =
          localStorage.getItem("accessToken") || localStorage.getItem("token");
      }

      if (!isValidToken(currentToken)) {
        console.error("No valid authentication token available");
        clearAuthData();
        redirectToLogin();
        throw new Error("No authentication token available");
      }

      const cleanUrl = url.startsWith("/") ? url : `/${url}`;
      const fullUrl = `${API_BASE_URL}${cleanUrl}`;

      console.log(`AuthRequest: ${method.toUpperCase()} ${fullUrl}`);

      const buildConfig = (requestToken) => {
        const headers = {
          "Content-Type": "application/json",
          ...customConfig.headers,
          Authorization: `Bearer ${requestToken}`,
        };

        if (data instanceof FormData) {
          delete headers["Content-Type"];
        }

        const isMutating = ["post", "put", "patch", "delete"].includes(
          method.toLowerCase(),
        );
        const shouldAttachData =
          data !== null && (isMutating || data instanceof FormData);

        return {
          method: method.toLowerCase(),
          url: fullUrl,
          headers,
          withCredentials: true,
          timeout: 30000,
          ...Object.fromEntries(
            Object.entries(customConfig).filter(
              ([k]) => !["headers", "skipRefresh"].includes(k),
            ),
          ),
          ...(shouldAttachData && { data }),
        };
      };

      try {
        const config = buildConfig(currentToken);
        const response = await axios(config);

        console.log(
          `AuthRequest success: ${method.toUpperCase()} ${url}`,
          response.status,
        );

        return response.data;
      } catch (error) {
        console.error(
          `Auth request error (${method.toUpperCase()} ${url}):`,
          error,
        );

        if (error.response) {
          console.error("Response status:", error.response.status);
          console.error("Response data:", error.response.data);

          if (error.response.status === 401 && !customConfig.skipRefresh) {
            const refreshedToken = await tryRefreshAccessToken();
            if (refreshedToken) {
              const retryResponse = await axios(buildConfig(refreshedToken));
              return retryResponse.data;
            }
          }

          if (error.response.status === 401) {
            console.log("Unauthorized - redirecting to login");
            window.dispatchEvent(new CustomEvent("auth:expired"));
            clearAuthData();
            setToken(null);
            setUser(null);
            setUserType(null);
            redirectToLogin();
          }
        }

        throw error;
      }
    },
    [token, logout, tryRefreshAccessToken],
  );

  const get = useCallback(
    async (url, config = {}) => authRequest("GET", url, null, config),
    [authRequest],
  );

  const post = useCallback(
    async (url, data = null, config = {}) =>
      authRequest("POST", url, data, config),
    [authRequest],
  );

  const put = useCallback(
    async (url, data = null, config = {}) =>
      authRequest("PUT", url, data, config),
    [authRequest],
  );

  const patch = useCallback(
    async (url, data = null, config = {}) =>
      authRequest("PATCH", url, data, config),
    [authRequest],
  );

  const del = useCallback(
    async (url, config = {}) => authRequest("DELETE", url, null, config),
    [authRequest],
  );

  const checkBackendStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/health`, {
        timeout: 5000,
      });
      return { reachable: true, status: response.status };
    } catch (error) {
      console.warn("Backend not reachable:", error.message);
      return { reachable: false, error: error.message };
    }
  }, []);

  const refreshToken = useCallback(async () => {
    const newToken = await tryRefreshAccessToken();
    if (newToken) return { success: true, token: newToken };
    logout();
    return { success: false, error: "Failed to refresh token" };
  }, [tryRefreshAccessToken, logout]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      forgotPassword,
      resetPassword,
      token,
      loading,
      userType,
      initialized,
      isAuthenticated,
      getUserRole,
      getUserType,
      hasRole,
      hasAnyRole,
      isSuperAdmin,
      isAdmin,
      isTeam,
      authRequest,
      get,
      post,
      put,
      patch,
      delete: del,
      checkBackendStatus,
      refreshToken,
      expireSessionDueToInactivity,
    }),
    [
      user,
      token,
      loading,
      userType,
      initialized,
      isAuthenticated,
      authRequest,
      get,
      post,
      put,
      patch,
      del,
      logout,
      checkBackendStatus,
      refreshToken,
      expireSessionDueToInactivity,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
