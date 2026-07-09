import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthContexts";
import axios from "axios";

const ReportContext = createContext();

export const useReport = () => {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error("useReport must be used within a ReportProvider");
  return ctx;
};

const API_BASE_URL = "https://synversys-backend-dxx1.onrender.com/api/v1";

const getApiClient = (token) => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    withCredentials: true,
    timeout: 30000,
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
    }
  );
  return client;
};

// Normalise report data from various API response shapes
const normaliseReport = (raw, fallbackType = "") => {
  if (!raw) return null;
  
  // Handle both { success, data: { ... } } and direct { ... } responses
  const inner = raw.data ?? raw;
  
  // Extract data arrays based on report type
  let dataArray = [];
  let summary = {};
  
  // Check for different data structures
  if (inner.clients) {
    dataArray = inner.clients;
    summary = inner.summary || {};
  } else if (inner.teamMembers) {
    dataArray = inner.teamMembers;
    summary = inner.summary || {};
  } else if (inner.assets) {
    dataArray = inner.assets;
    summary = inner.summary || {};
  } else if (inner.checklists) {
    dataArray = inner.checklists;
    summary = inner.summary || {};
  } else if (inner.assignments) {
    dataArray = inner.assignments;
    summary = inner.summary || {};
  } else if (inner.submissions) {
    dataArray = inner.submissions;
    summary = inner.summary || {};
  } else if (inner.requests) {
    dataArray = inner.requests;
    summary = inner.summary || {};
  } else if (inner.logs) {
    dataArray = inner.logs;
    summary = inner.summary || {};
  } else if (inner.inquiries) {
    dataArray = inner.inquiries;
    summary = inner.summary || {};
  } else if (inner.financialData || inner.revenue) {
    dataArray = inner.financialData || inner.revenue || [];
    summary = inner.summary || {};
  } else if (Array.isArray(inner.data)) {
    dataArray = inner.data;
    summary = inner.summary || {};
  } else if (Array.isArray(inner)) {
    dataArray = inner;
  }

  return {
    reportType: inner.reportType || fallbackType,
    generatedAt: inner.generatedAt || new Date().toISOString(),
    summary: summary,
    data: dataArray,
    totalRecords: dataArray.length,
    metadata: inner.metadata || {},
  };
};

const extractError = (err) => {
  if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return null;
  if (err.code === "ECONNABORTED") return "Request timed out. Please try again.";
  if (err.response?.status === 403) return "You don't have permission to access this report.";
  if (err.response?.status === 404) return "Report endpoint not found.";
  if (err.response?.status >= 500) return "Server error. Please try again later.";
  return err.response?.data?.message || err.message || "An unexpected error occurred.";
};

export const ReportProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [exporting, setExporting] = useState(false);

  const abortMap = useRef({});

  const cancelKey = useCallback((key) => {
    abortMap.current[key]?.abort();
    const ctrl = new AbortController();
    abortMap.current[key] = ctrl;
    return ctrl.signal;
  }, []);

  const isSuperAdmin = useCallback(
    () => user?.role === "super_admin" || user?.role === "superadmin",
    [user]
  );
  const isAdmin = useCallback(() => user?.role === "admin", [user]);

  const hasReportAccess = useCallback(
    (reportType) => {
      if (isSuperAdmin()) return true;
      const adminTypes = [
        "assets", "team", "checklists", "assignments", "inspections",
        "compliance", "asset-requests", "checklist-submissions",
      ];
      const teamTypes = [
        "assignments", "asset-requests", "checklist-submissions", "inspections",
      ];
      if (isAdmin()) return adminTypes.includes(reportType);
      return teamTypes.includes(reportType);
    },
    [isAdmin, isSuperAdmin]
  );

  const fetchReport = useCallback(
    async ({ endpoint, reportType, filters = {}, format = "json", accessCheck }) => {
      if (!isAuthenticated || !token) return null;
      if (accessCheck && !accessCheck()) {
        setError(`You don't have permission to access ${reportType} reports.`);
        return null;
      }

      const signal = cancelKey(reportType);
      setError(null);
      setLoading(true);

      try {
        const api = getApiClient(token);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") params.append(k, v);
        });
        if (format !== "json") params.append("format", format);

        const url = `${endpoint}?${params.toString()}`;
        const config = {
          signal,
          ...(format !== "json" && { responseType: "blob" }),
        };

        const response = await api.get(url, config);

        if (format !== "json") return response.data;

        const raw = response.data;
        if (raw?.success === false) {
          throw new Error(raw.message || `Failed to fetch ${reportType} report`);
        }

        const normalised = normaliseReport(raw, reportType);
        setReportData(normalised);
        return { success: true, message: raw.message, data: normalised };
      } catch (err) {
        const msg = extractError(err);
        if (msg) {
          console.error(`[ReportContext] ${reportType}:`, msg);
          setError(msg);
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, token, cancelKey]
  );

  // Report methods
  const getClientReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/clients",
        reportType: "clients",
        filters,
        format,
        accessCheck: isSuperAdmin,
      }),
    [fetchReport, isSuperAdmin]
  );

  const getIndividualClientReport = useCallback(
    (clientId, filters = {}) =>
      fetchReport({
        endpoint: "/reports/individual-client",
        reportType: "individual_client",
        filters: { clientId, ...filters },
        accessCheck: isSuperAdmin,
      }),
    [fetchReport, isSuperAdmin]
  );

  const getRevenueReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/financial",
        reportType: "revenue",
        filters,
        format,
        accessCheck: isSuperAdmin,
      }),
    [fetchReport, isSuperAdmin]
  );

  const getChecklistRequestsReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/checklist-requests",
        reportType: "checklist-requests",
        filters,
        format,
        accessCheck: isSuperAdmin,
      }),
    [fetchReport, isSuperAdmin]
  );

  const getContactInquiriesReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/contact-inquiries",
        reportType: "compliance",
        filters,
        format,
        accessCheck: isSuperAdmin,
      }),
    [fetchReport, isSuperAdmin]
  );

  const getAuditLogsReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/audit-logs",
        reportType: "inspections",
        filters,
        format,
        accessCheck: () => hasReportAccess("inspections"),
      }),
    [fetchReport, hasReportAccess]
  );

  const getTeamMembersReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/team-members",
        reportType: "team",
        filters,
        format,
        accessCheck: () => hasReportAccess("team"),
      }),
    [fetchReport, hasReportAccess]
  );

  const getIndividualTeamReport = useCallback(
    (teamId, filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/individual-team",
        reportType: "individual_team",
        filters: { teamId, ...filters },
        format,
        accessCheck: () => hasReportAccess("team"),
      }),
    [fetchReport, hasReportAccess]
  );

  const getAssetReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/assets",
        reportType: "assets",
        filters,
        format,
        accessCheck: () => hasReportAccess("assets"),
      }),
    [fetchReport, hasReportAccess]
  );

  const getAssetRequestsReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/asset-requests",
        reportType: "asset-requests",
        filters,
        format,
        accessCheck: () => hasReportAccess("asset-requests"),
      }),
    [fetchReport, hasReportAccess]
  );

  const getChecklistSubmissionsReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/checklist-submissions",
        reportType: "checklist-submissions",
        filters,
        format,
        accessCheck: () => hasReportAccess("checklist-submissions"),
      }),
    [fetchReport, hasReportAccess]
  );

  const getChecklistReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/checklists",
        reportType: "checklists",
        filters,
        format,
        accessCheck: () => hasReportAccess("checklists"),
      }),
    [fetchReport, hasReportAccess]
  );

  const getAssignmentReport = useCallback(
    (filters = {}, format = "json") =>
      fetchReport({
        endpoint: "/reports/assignments",
        reportType: "assignments",
        filters,
        format,
        accessCheck: () => hasReportAccess("assignments"),
      }),
    [fetchReport, hasReportAccess]
  );

  // Complete report export
  const exportCompleteReport = useCallback(
    async (format = "excel", dateRange = "this_month") => {
      if (!isAuthenticated || !token) return null;
      setExporting(true);
      setError(null);
      try {
        const api = getApiClient(token);
        const response = await api.get(
          `/reports/export/complete?format=${format}&dateRange=${dateRange}`,
          { responseType: "blob" }
        );
        return response.data;
      } catch (err) {
        setError(extractError(err));
        return null;
      } finally {
        setExporting(false);
      }
    },
    [isAuthenticated, token]
  );

  const cleanup = useCallback(() => {
    Object.values(abortMap.current).forEach((ctrl) => ctrl.abort());
    abortMap.current = {};
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearReportData = useCallback(() => setReportData(null), []);

  return (
    <ReportContext.Provider
      value={{
        loading,
        exporting,
        error,
        reportData,
        getClientReport,
        getIndividualClientReport,
        getRevenueReport,
        getChecklistRequestsReport,
        getContactInquiriesReport,
        getAuditLogsReport,
        getTeamMembersReport,
        getIndividualTeamReport,
        getAssetReport,
        getAssetRequestsReport,
        getChecklistSubmissionsReport,
        getChecklistReport,
        getAssignmentReport,
        exportCompleteReport,
        clearError,
        clearReportData,
        cleanup,
        isAdmin: isAdmin(),
        isSuperAdmin: isSuperAdmin(),
        hasReportAccess,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};