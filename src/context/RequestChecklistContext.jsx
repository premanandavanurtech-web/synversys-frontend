// context/RequestChecklistContext.jsx - Complete with All API Methods

import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContexts";

const RequestChecklistContext = createContext();

export const useRequestChecklist = () => {
  const context = useContext(RequestChecklistContext);
  if (!context) {
    throw new Error("useRequestChecklist must be used within RequestChecklistProvider");
  }
  return context;
};

const extractData = (response) => response?.data ?? response;

export const RequestChecklistProvider = ({ children }) => {
  const { authRequest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const extractError = (err, fallback) => err?.response?.data?.message || err?.message || fallback;

  // Submit a new checklist request
  const submitRequest = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authRequest("POST", "/checklist-requests", formData);
      if (response?.success) {
        setSuccess("Checklist request submitted successfully!");
        return { success: true, data: extractData(response) };
      }
      throw new Error(response?.message || "Failed to submit request");
    } catch (err) {
      const msg = extractError(err, "Failed to submit request");
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // Get all requests (Admin/Super Admin)
  const getAllRequests = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams();
      if (filters.status) q.append("status", filters.status);
      if (filters.urgencyLevel) q.append("urgencyLevel", filters.urgencyLevel);
      if (filters.category) q.append("category", filters.category);
      if (filters.search) q.append("search", filters.search);
      if (filters.page) q.append("page", String(filters.page));
      if (filters.limit) q.append("limit", String(filters.limit));
      if (filters.fromDate) q.append("fromDate", filters.fromDate);
      if (filters.toDate) q.append("toDate", filters.toDate);
      if (filters.sortBy) q.append("sortBy", filters.sortBy);
      if (filters.sortOrder) q.append("sortOrder", filters.sortOrder);
      if (filters.includeDeleted === true) q.append("includeDeleted", "true");

      const url = `/checklist-requests${q.toString() ? `?${q}` : ""}`;
      const response = await authRequest("GET", url);
      const raw = extractData(response);
      return {
        success: true,
        data: {
          requests: raw?.requests ?? [],
          pagination: raw?.pagination ?? {},
          filters: raw?.filters ?? {},
        },
      };
    } catch (err) {
      const msg = extractError(err, "Failed to fetch requests");
      setError(msg);
      return { success: false, error: msg, data: { requests: [], pagination: {} } };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // Get current user's own requests
  const getMyRequests = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams();
      if (filters.status) q.append("status", filters.status);
      if (filters.page) q.append("page", String(filters.page));
      if (filters.limit) q.append("limit", String(filters.limit));

      const url = `/checklist-requests/my-requests${q.toString() ? `?${q}` : ""}`;
      const response = await authRequest("GET", url);
      const raw = extractData(response);
      return {
        success: true,
        data: {
          requests: raw?.requests ?? [],
          pagination: raw?.pagination ?? {},
        },
      };
    } catch (err) {
      const msg = extractError(err, "Failed to fetch your requests");
      setError(msg);
      return { success: false, error: msg, data: { requests: [], pagination: {} } };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // Get single request by ID
  const getRequestById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authRequest("GET", `/checklist-requests/${id}`);
      const raw = extractData(response);
      return { success: true, data: raw };
    } catch (err) {
      const msg = extractError(err, "Failed to fetch request");
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // Review a request (Super Admin only)
  const reviewRequest = useCallback(async (id, status, { rejectionReason, resultingChecklistId, resultingChecklistName, comments } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const body = { status };
      if (status === "rejected" && rejectionReason) body.rejectionReason = rejectionReason;
      if (status === "approved") {
        if (resultingChecklistId) body.resultingChecklistId = resultingChecklistId;
        if (resultingChecklistName) body.resultingChecklistName = resultingChecklistName;
      }
      if (comments) body.comments = comments;

      const response = await authRequest("PUT", `/checklist-requests/${id}/review`, body);
      if (response?.success) {
        setSuccess(`Request ${status.replace(/_/g, " ")} successfully!`);
        return { success: true, data: extractData(response) };
      }
      throw new Error(response?.message || "Failed to review request");
    } catch (err) {
      const msg = extractError(err, "Failed to review request");
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // Soft delete a request
  const softDeleteRequest = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authRequest("DELETE", `/checklist-requests/${id}`);
      if (response?.success) {
        setSuccess("Request soft deleted successfully!");
        return { success: true, data: extractData(response) };
      }
      throw new Error(response?.message || "Failed to delete request");
    } catch (err) {
      const msg = extractError(err, "Failed to delete request");
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // Restore a soft-deleted request
  const restoreRequest = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authRequest("PATCH", `/checklist-requests/${id}/restore`);
      if (response?.success) {
        setSuccess("Request restored successfully!");
        return { success: true, data: extractData(response) };
      }
      throw new Error(response?.message || "Failed to restore request");
    } catch (err) {
      const msg = extractError(err, "Failed to restore request");
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // Permanently delete a request
  const permanentDeleteRequest = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authRequest("DELETE", `/checklist-requests/${id}/permanent`);
      if (response?.success) {
        setSuccess("Request permanently deleted successfully!");
        return { success: true, data: extractData(response) };
      }
      throw new Error(response?.message || "Failed to permanently delete request");
    } catch (err) {
      const msg = extractError(err, "Failed to permanently delete request");
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // Get deleted requests (recycle bin)
  const getDeletedRequests = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams();
      if (filters.search) q.append("search", filters.search);
      if (filters.status) q.append("status", filters.status);
      if (filters.urgencyLevel) q.append("urgencyLevel", filters.urgencyLevel);
      if (filters.page) q.append("page", String(filters.page));
      if (filters.limit) q.append("limit", String(filters.limit));

      const url = `/checklist-requests/deleted${q.toString() ? `?${q}` : ""}`;
      const response = await authRequest("GET", url);
      const raw = extractData(response);
      return {
        success: true,
        data: {
          requests: raw?.requests ?? [],
          pagination: raw?.pagination ?? {},
          filters: raw?.filters ?? {},
        },
      };
    } catch (err) {
      const msg = extractError(err, "Failed to fetch deleted requests");
      setError(msg);
      return { success: false, error: msg, data: { requests: [], pagination: {} } };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // Get request statistics
  const getRequestStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authRequest("GET", "/checklist-requests/statistics/all");
      const raw = extractData(response);
      return {
        success: true,
        data: {
          summary: raw?.summary ?? {},
          recentRequests: raw?.recentRequests ?? {},
          reviewMetrics: raw?.reviewMetrics ?? {},
          breakdowns: raw?.breakdowns ?? {},
        },
      };
    } catch (err) {
      const msg = extractError(err, "Failed to fetch statistics");
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const value = {
    loading,
    error,
    success,
    submitRequest,
    getAllRequests,
    getMyRequests,
    getRequestById,
    softDeleteRequest,
    restoreRequest,
    permanentDeleteRequest,
    getDeletedRequests,
    reviewRequest,
    getRequestStats,
    clearMessages,
  };

  return <RequestChecklistContext.Provider value={value}>{children}</RequestChecklistContext.Provider>;
};