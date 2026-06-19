// context/DashboardContext.js
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useAuth } from "./AuthContexts";
import axios from "axios";

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context)
    throw new Error("useDashboard must be used within a DashboardProvider");
  return context;
};

const API_BASE_URL = "https://synversys-backend.onrender.com/api/v1";

const createApiClient = (token) => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
    timeout: 15000,
  });

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(err);
    },
  );

  return client;
};

// ─── Filter Helpers ───────────────────────────────────────────────────────────

/**
 * Returns { dateRange, startDate, endDate, period } query params
 * from a filter preset string or a custom {start, end} object.
 *
 * Preset values: "today" | "7d" | "30d" | "monthly" | "yearly" | "custom"
 * For "custom" pass filters.startDate / filters.endDate as ISO strings.
 */
export const buildFilterParams = (filters = {}) => {
  const { preset = "30d", startDate, endDate } = filters;

  const today = new Date();
  const fmt = (d) => d.toISOString().split("T")[0];

  switch (preset) {
    case "today":
      return {
        startDate: fmt(today),
        endDate: fmt(today),
        period: "daily",
      };
    case "7d":
      const s7 = new Date(today);
      s7.setDate(s7.getDate() - 6);
      return { startDate: fmt(s7), endDate: fmt(today), period: "daily" };
    case "30d":
      const s30 = new Date(today);
      s30.setDate(s30.getDate() - 29);
      return { startDate: fmt(s30), endDate: fmt(today), period: "weekly" };
    case "monthly":
      const sM = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: fmt(sM), endDate: fmt(today), period: "monthly" };
    case "yearly":
      return {
        startDate: `${today.getFullYear()}-01-01`,
        endDate: fmt(today),
        period: "monthly",
      };
    case "custom":
      if (!startDate || !endDate) return { dateRange: 30, period: "monthly" };
      // Auto-pick period based on date span
      const diff =
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
      const period = diff <= 7 ? "daily" : diff <= 60 ? "weekly" : "monthly";
      return { startDate, endDate, period };
    default:
      return { dateRange: 30, period: "monthly" };
  }
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const DashboardProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Track the active filter so the UI can read it back
  const [activeFilter, setActiveFilter] = useState({ preset: "30d" });

  const abortRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const safe = useCallback((setter, val) => {
    if (isMounted.current) setter(val);
  }, []);

  /**
   * loadDashboard({ preset, startDate, endDate })
   *
   * Accepts a filter object. Converts preset shortcuts to actual API params
   * before hitting GET /dashboard. The server returns role-specific data.
   */
  const loadDashboard = useCallback(
    async (filters = {}) => {
      if (!isAuthenticated || !token) return null;

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      safe(setError, null);
      safe(setLoading, true);
      safe(setActiveFilter, filters);

      try {
        const api = createApiClient(token);
        const params = new URLSearchParams();

        const apiParams = buildFilterParams(filters);
        Object.entries(apiParams).forEach(([k, v]) => {
          if (v !== undefined && v !== null) params.append(k, v);
        });

        const res = await api.get(`/dashboard?${params.toString()}`, {
          signal: abortRef.current.signal,
        });

        if (res.data?.success) {
          safe(setDashboardData, res.data);
          safe(setDataLoaded, true);
          return res.data;
        }

        throw new Error(res.data?.message || "Failed to fetch dashboard");
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          const msg =
            err.response?.data?.message || err.message || "Unexpected error";
          console.error("[DashboardContext] loadDashboard error:", msg);
          safe(setError, msg);
        }
        return null;
      } finally {
        safe(setLoading, false);
      }
    },
    [isAuthenticated, token, safe],
  );

  const clearError = useCallback(() => safe(setError, null), [safe]);

  const refresh = useCallback(
    (filters) => {
      safe(setDataLoaded, false);
      return loadDashboard(filters ?? activeFilter);
    },
    [loadDashboard, safe, activeFilter],
  );

  return (
    <DashboardContext.Provider
      value={{
        dashboardData,
        loading,
        error,
        dataLoaded,
        activeFilter,
        loadDashboard,
        refresh,
        clearError,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
