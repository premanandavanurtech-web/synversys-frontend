// src/context/TeamAssignmentContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContexts";

const TeamAssignmentContext = createContext();

export const useTeamAssignment = () => {
  const ctx = useContext(TeamAssignmentContext);
  if (!ctx)
    throw new Error("useTeamAssignment must be used within TeamAssignmentProvider");
  return ctx;
};

export const TeamAssignmentProvider = ({ children }) => {
  const { authRequest } = useAuth();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ── GET /assignments/team/my-tasks ────────────────────────────────────────
  const fetchMyTasks = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.search) params.append("search", filters.search);
      if (filters.date) params.append("date", filters.date);
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit || 20));
      // NEW: ask the backend for newest-first ordering so newly assigned/
      // created tasks show up first. If your backend expects a different
      // param name (e.g. sortBy=createdAt&order=desc), this is the one
      // line to change — everything else stays the same.
      params.append("sort", "-createdAt");

      const url = `/assignments/team/my-tasks${params.toString() ? `?${params}` : ""}`;
      const response = await authRequest("GET", url);

      if (response?.success) {
        return {
          success: true,
          tasks: response.tasks || response.assignments || [],
          pagination: response.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 1,
          },
          stats: response.stats || null,
        };
      }
      throw new Error(response?.message || "Failed to fetch tasks");
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // ── GET /assignments/team/my-tasks/:assignmentId ──────────────────────────
  const fetchTaskById = useCallback(async (assignmentId) => {
    if (!assignmentId || assignmentId === "undefined" || assignmentId === "null") {
      return { success: false, error: "Invalid assignment ID" };
    }
    setLoading(true);
    setError(null);
    try {
      const response = await authRequest(
        "GET",
        `/assignments/team/my-tasks/${assignmentId}`
      );

      if (response?.success === false) {
        throw new Error(response?.message || "Failed to fetch task details");
      }

      const task = response?.assignment ?? response?.task ?? response?.data ?? response;

      if (!task?._id) {
        throw new Error("Unexpected response format from server");
      }

      return { success: true, task };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // ── GET /checklist-submissions/my-inspections ─────────────────────────────
  const fetchInspectionHistory = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const url = `/checklist-submissions/my-inspections?page=${page}&limit=${limit}`;
      const response = await authRequest("GET", url);

      if (response?.success) {
        return {
          success: true,
          inspections: response.inspections || [],
          pagination: response.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
          summary: response.summary || {
            total: 0,
            pendingReview: 0,
            approved: 0,
            rejected: 0,
            needsRevision: 0,
            avgCompletionRate: 0,
            totalImages: 0,
            totalAttachments: 0,
          },
        };
      }
      throw new Error(response?.message || "Failed to fetch inspection history");
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Failed to fetch inspections";
      console.error("[TeamAssignment] fetchInspectionHistory:", message);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // ── GET /checklist-submissions/my-inspections/:submissionId ───────────────
  const fetchInspectionById = useCallback(async (submissionId) => {
    if (!submissionId || submissionId === "undefined" || submissionId === "null") {
      return { success: false, error: "Invalid inspection ID" };
    }
    setLoading(true);
    setError(null);
    try {
      const url = `/checklist-submissions/my-inspections/${submissionId}`;
      const response = await authRequest("GET", url);

      if (response?.success) {
        return {
          success: true,
          inspection: response,
          assignment: response.assignment || null,
        };
      }
      throw new Error(response?.message || "Failed to fetch inspection details");
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Failed to fetch inspection";
      console.error("[TeamAssignment] fetchInspectionById:", message);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // ── POST /checklist-submissions/:assignmentId/submit ──────────────────────
  const submitAssignment = useCallback(async (assignmentId, formData) => {
    if (!assignmentId || assignmentId === "undefined" || assignmentId === "null") {
      return { success: false, error: "Invalid assignment ID" };
    }

    setSubmitting(true);
    setError(null);

    try {
      let payload;
      if (formData instanceof FormData) {
        payload = formData;
      } else {
        payload = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
          if (Array.isArray(v)) {
            v.forEach((item) => payload.append(k, item));
          } else {
            payload.append(k, v);
          }
        });
      }

      const response = await authRequest(
        "POST",
        `/checklist-submissions/${assignmentId}/submit`,
        payload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response?.success) {
        return {
          success: true,
          submission: response.submission || response.data,
          message: response.message || "Assignment submitted successfully",
        };
      }

      throw new Error(response?.message || "Submission failed");
    } catch (err) {
      const message = err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Failed to submit assignment";
      console.error("[TeamAssignment] submitAssignment:", message);
      setError(message);
      return { success: false, error: message };
    } finally {
      setSubmitting(false);
    }
  }, [authRequest]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <TeamAssignmentContext.Provider
      value={{
        loading,
        submitting,
        error,
        clearError,
        fetchMyTasks,
        fetchTaskById,
        submitAssignment,
        fetchInspectionHistory,
        fetchInspectionById
      }}
    >
      {children}
    </TeamAssignmentContext.Provider>
  );
};

export default TeamAssignmentProvider;