// context/AssignmentContext.jsx
// Covers all assignment-related API calls used across:
//   AssignmentDetailPage, AssignmentAnalyticsPage, AssignedChecklist, RecycleBin

import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContexts";

const AssignmentContext = createContext();

export const useAssignment = () => {
  const ctx = useContext(AssignmentContext);
  if (!ctx) throw new Error("useAssignment must be used within AssignmentProvider");
  return ctx;
};

// ── Reusable op-state hook ────────────────────────────────────────────────────
const useOpState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const clear = useCallback(() => { setError(null); setSuccess(null); }, []);
  return { loading, setLoading, error, setError, success, setSuccess, clear };
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const extractError = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

const fmtDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

const buildParams = (filters = {}) => {
  const params = new URLSearchParams();
  const allowed = [
    "page", "limit", "status", "priority", "search",
    "assignedTo", "fromDate", "toDate", "assignmentType",
  ];
  allowed.forEach(k => { if (filters[k] != null) params.append(k, filters[k]); });
  return params.toString();
};

// ── Provider ──────────────────────────────────────────────────────────────────
export const AssignmentProvider = ({ children }) => {
  const { authRequest } = useAuth();

  // Separate op-states per concern so loading flags don't bleed across actions
  const assignOp = useOpState();
  const fetchOp = useOpState();
  const deleteOp = useOpState();
  const restoreOp = useOpState();
  const statsOp = useOpState();
  const detailOp = useOpState();
  const subOp = useOpState();   // submissions

  // ── 1. Assign to admin ──────────────────────────────────────────────────────
  const assignToAdmin = useCallback(async (data) => {
    assignOp.setLoading(true);
    assignOp.setError(null);
    try {
      if (!data.checklistIds?.length) throw new Error("At least one checklist is required");
      if (!data.adminId) throw new Error("Admin ID is required");
      if (!data.dueDate) throw new Error("Due date is required");
      if (!data.priority) throw new Error("Priority is required");

      const payload = {
        checklistIds: data.checklistIds,
        adminId: data.adminId,
        dueDate: fmtDate(data.dueDate),
        priority: data.priority,
      };
      if (data.notes?.trim()) payload.notes = data.notes.trim();

      const res = await authRequest("POST", "/assignments/assign-to-admin", payload);
      if (res?.success) {
        assignOp.setSuccess("Checklist(s) assigned to admin successfully!");
        return { success: true, data: res.assignment || res.data, message: res.message };
      }
      const msg = res?.message || "Assignment failed";
      assignOp.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to assign to admin");
      assignOp.setError(msg);
      return { success: false, error: msg };
    } finally {
      assignOp.setLoading(false);
    }
  }, [authRequest]);

  // ── 2. Assign to team ───────────────────────────────────────────────────────
  const assignToTeam = useCallback(async (data) => {
    assignOp.setLoading(true);
    assignOp.setError(null);
    try {
      if (!data.teamMemberIds?.length) throw new Error("At least one team member is required");
      if (!data.dueDate) throw new Error("Due date is required");
      if (!data.priority) throw new Error("Priority is required");

      const hasChecklists = data.checklistIds?.length > 0;
      const hasAssets = data.assetIds?.length > 0;
      if (!hasChecklists && !hasAssets)
        throw new Error("At least one checklist or asset is required");

      const payload = {
        teamMemberIds: data.teamMemberIds,
        dueDate: fmtDate(data.dueDate),
        priority: data.priority,
      };
      if (hasChecklists) payload.checklistIds = data.checklistIds;
      if (hasAssets) payload.assetIds = data.assetIds;
      if (data.notes?.trim()) payload.notes = data.notes.trim();
      if (data.assignmentType) payload.assignmentType = data.assignmentType;

      const res = await authRequest("POST", "/assignments/assign-to-team", payload);
      if (res?.success) {
        assignOp.setSuccess("Assignment created successfully!");
        return { success: true, data: res.assignment || res.data, message: res.message };
      }
      const msg = res?.message || "Assignment failed";
      assignOp.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to assign to team");
      assignOp.setError(msg);
      return { success: false, error: msg };
    } finally {
      assignOp.setLoading(false);
    }
  }, [authRequest]);

  // ── 3. Get all assignments (list) ───────────────────────────────────────────
  const getAssignments = useCallback(async (filters = {}) => {
    fetchOp.setLoading(true);
    fetchOp.setError(null);
    try {
      const qs = buildParams(filters);
      const res = await authRequest("GET", `/assignments${qs ? `?${qs}` : ""}`);
      if (res?.success) {
        return {
          success: true,
          assignments: res.assignments || [],
          pagination: res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
          stats: res.stats || null,
        };
      }
      const msg = res?.message || "Failed to fetch assignments";
      fetchOp.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to fetch assignments");
      fetchOp.setError(msg);
      return { success: false, error: msg };
    } finally {
      fetchOp.setLoading(false);
    }
  }, [authRequest]);

  // ── 4. Get single assignment detail ────────────────────────────────────────
  const getAssignmentById = useCallback(async (assignmentId) => {
    detailOp.setLoading(true);
    detailOp.setError(null);
    try {
      if (!assignmentId) throw new Error("Assignment ID is required");
      const res = await authRequest("GET", `/assignments/${assignmentId}`);
      if (res?.success) {
        return { success: true, data: res };
      }
      const msg = res?.message || "Failed to fetch assignment";
      detailOp.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to fetch assignment");
      detailOp.setError(msg);
      return { success: false, error: msg };
    } finally {
      detailOp.setLoading(false);
    }
  }, [authRequest]);

  // ── 5. Get assignment analytics ─────────────────────────────────────────────
  const getAssignmentAnalytics = useCallback(async (assignmentId) => {
    detailOp.setLoading(true);
    detailOp.setError(null);
    try {
      if (!assignmentId) throw new Error("Assignment ID is required");
      const res = await authRequest("GET", `/assignments/${assignmentId}/analytics`);
      if (res?.success) {
        return {
          success: true,
          assignment: res.assignment || null,
          analytics: res.analytics || {},
          teamProgress: res.teamProgress || [],
          recentSubmissions: res.recentSubmissions || [],
          checklistSubmissionStatus: res.checklistSubmissionStatus || [],
          summary: res.summary || {},
        };
      }
      const msg = res?.message || "Failed to fetch analytics";
      detailOp.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to fetch analytics");
      detailOp.setError(msg);
      return { success: false, error: msg };
    } finally {
      detailOp.setLoading(false);
    }
  }, [authRequest]);

  // ── 6. Get team progress ────────────────────────────────────────────────────
  const getTeamProgress = useCallback(async (assignmentId) => {
    fetchOp.setLoading(true);
    fetchOp.setError(null);
    try {
      if (!assignmentId) throw new Error("Assignment ID is required");
      const res = await authRequest("GET", `/assignments/${assignmentId}/team-progress`);
      if (res?.success) {
        return {
          success: true,
          assignmentId: res.assignmentId,
          assignmentStatus: res.assignmentStatus,
          dueDate: res.dueDate,
          teamProgress: res.teamProgress || [],
          summary: res.summary || {},
        };
      }
      const msg = res?.message || "Failed to fetch team progress";
      fetchOp.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to fetch team progress");
      fetchOp.setError(msg);
      return { success: false, error: msg };
    } finally {
      fetchOp.setLoading(false);
    }
  }, [authRequest]);

  // ── 7. Get recent submissions for an assignment ─────────────────────────────
  const getRecentSubmissions = useCallback(async (assignmentId, filters = {}) => {
    subOp.setLoading(true);
    subOp.setError(null);
    try {
      if (!assignmentId) throw new Error("Assignment ID is required");
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);
      const qs = params.toString();
      const res = await authRequest("GET", `/assignments/${assignmentId}/recent-submissions${qs ? `?${qs}` : ""}`);
      if (res?.success) {
        return {
          success: true,
          submissions: res.submissions || [],
          pagination: res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
        };
      }
      const msg = res?.message || "Failed to fetch submissions";
      subOp.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to fetch submissions");
      subOp.setError(msg);
      return { success: false, error: msg };
    } finally {
      subOp.setLoading(false);
    }
  }, [authRequest]);

  // ── 8. Get single submission detail ────────────────────────────────────────
  const getSubmissionById = useCallback(async (submissionId) => {
    subOp.setLoading(true);
    subOp.setError(null);
    try {
      if (!submissionId) throw new Error("Submission ID is required");
      const res = await authRequest("GET", `/assignments/submissions/${submissionId}`);
      if (res?.success) {
        return {
          success: true,
          submission: res.submission || null,
          checklistStats: res.checklistStats || [],
          attachmentCount: res.attachmentCount || 0,
          imageCount: res.imageCount || 0,
        };
      }
      const msg = res?.message || "Failed to fetch submission";
      subOp.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to fetch submission");
      subOp.setError(msg);
      return { success: false, error: msg };
    } finally {
      subOp.setLoading(false);
    }
  }, [authRequest]);

  // ── 9. Get assignment stats (dashboard summary) ─────────────────────────────
  const getAssignmentStats = useCallback(async () => {
    statsOp.setLoading(true);
    statsOp.setError(null);
    try {
      const res = await authRequest("GET", "/assignments/stats");
      if (res?.success) {
        return {
          success: true,
          stats: {
            total: res.total || 0,
            byStatus: res.byStatus || {},
            byPriority: res.byPriority || {},
            overdue: res.overdue || 0,
            completionRate: res.completionRate || 0,
          },
        };
      }
      const msg = res?.message || "Failed to fetch stats";
      statsOp.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to fetch assignment stats");
      statsOp.setError(msg);
      return { success: false, error: msg };
    } finally {
      statsOp.setLoading(false);
    }
  }, [authRequest]);

  // ── 10. Soft delete ─────────────────────────────────────────────────────────
  const softDeleteAssignment = useCallback(async (assignmentId) => {
    deleteOp.setLoading(true);
    deleteOp.setError(null);
    try {
      const res = await authRequest("DELETE", `/assignments/${assignmentId}/soft`);
      if (res?.success) {
        deleteOp.setSuccess("Assignment moved to trash!");
        return { success: true, message: res.message };
      }
      const msg = res?.message || "Failed to delete assignment";
      deleteOp.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to delete assignment");
      deleteOp.setError(msg);
      return { success: false, error: msg };
    } finally {
      deleteOp.setLoading(false);
    }
  }, [authRequest]);

  // ── 11. Restore from trash ──────────────────────────────────────────────────
  const restoreAssignment = useCallback(async (assignmentId) => {
    restoreOp.setLoading(true);
    restoreOp.setError(null);
    try {
      const res = await authRequest("PUT", `/assignments/${assignmentId}/restore`);
      if (res?.success) {
        restoreOp.setSuccess("Assignment restored successfully!");
        return { success: true, message: res.message };
      }
      const msg = res?.message || "Failed to restore assignment";
      restoreOp.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to restore assignment");
      restoreOp.setError(msg);
      return { success: false, error: msg };
    } finally {
      restoreOp.setLoading(false);
    }
  }, [authRequest]);

  // ── 12. Bulk restore from trash ─────────────────────────────────────────────
  const bulkRestoreAssignments = useCallback(async (assignmentIds) => {
    restoreOp.setLoading(true);
    restoreOp.setError(null);
    try {
      if (!assignmentIds?.length) throw new Error("No assignment IDs provided");
      const res = await authRequest("PUT", "/assignments/bulk-restore", { assignmentIds });
      if (res?.success) {
        restoreOp.setSuccess(`${assignmentIds.length} assignment(s) restored!`);
        return { success: true, message: res.message };
      }
      const msg = res?.message || "Failed to bulk restore";
      restoreOp.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to bulk restore assignments");
      restoreOp.setError(msg);
      return { success: false, error: msg };
    } finally {
      restoreOp.setLoading(false);
    }
  }, [authRequest]);

  // ── 13. Bulk soft delete ────────────────────────────────────────────────────
  const bulkDeleteAssignments = useCallback(async (assignmentIds) => {
    deleteOp.setLoading(true);
    deleteOp.setError(null);
    try {
      if (!assignmentIds?.length) throw new Error("No assignment IDs provided");
      const res = await authRequest("DELETE", "/assignments/bulk-soft", { assignmentIds });
      if (res?.success) {
        deleteOp.setSuccess(`${assignmentIds.length} assignment(s) moved to trash!`);
        return { success: true, message: res.message };
      }
      const msg = res?.message || "Failed to bulk delete";
      deleteOp.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to bulk delete assignments");
      deleteOp.setError(msg);
      return { success: false, error: msg };
    } finally {
      deleteOp.setLoading(false);
    }
  }, [authRequest]);

  // ── 14. Reassign to admin ───────────────────────────────────────────────────
  const reassignToAdmin = useCallback(async (assignmentId, data) => {
    assignOp.setLoading(true);
    assignOp.setError(null);
    try {
      if (!assignmentId) throw new Error("Assignment ID is required");
      if (!data.newAdminId) throw new Error("New Admin ID is required");

      const payload = { newAdminId: data.newAdminId };
      if (data.dueDate) payload.dueDate = fmtDate(data.dueDate);
      if (data.priority) payload.priority = data.priority;
      if (data.notes?.trim()) payload.notes = data.notes.trim();
      if (data.reason?.trim()) payload.reason = data.reason.trim();

      const res = await authRequest("PUT", `/assignments/${assignmentId}/reassign-to-admin`, payload);
      if (res?.success) {
        assignOp.setSuccess("Re-assigned to admin successfully!");
        return { success: true, data: res.assignment || res.data };
      }
      const msg = res?.message || "Re-assignment failed";
      assignOp.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to re-assign to admin");
      assignOp.setError(msg);
      return { success: false, error: msg };
    } finally {
      assignOp.setLoading(false);
    }
  }, [authRequest]);

  // ── 15. Reassign to team ────────────────────────────────────────────────────
  const reassignToTeam = useCallback(async (assignmentId, data) => {
    assignOp.setLoading(true);
    assignOp.setError(null);
    try {
      if (!assignmentId) throw new Error("Assignment ID is required");
      if (!data.teamMemberIds?.length) throw new Error("At least one team member is required");

      const payload = { teamMemberIds: data.teamMemberIds };
      if (data.dueDate) payload.dueDate = fmtDate(data.dueDate);
      if (data.priority) payload.priority = data.priority;
      if (data.notes?.trim()) payload.notes = data.notes.trim();
      if (data.reason?.trim()) payload.reason = data.reason.trim();
      if (data.assetIds?.length) payload.assetIds = data.assetIds;

      const res = await authRequest("PUT", `/assignments/${assignmentId}/reassign-to-team`, payload);
      if (res?.success) {
        assignOp.setSuccess("Re-assigned to team successfully!");
        return { success: true, data: res.assignment || res.data };
      }
      const msg = res?.message || "Re-assignment failed";
      assignOp.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to re-assign to team");
      assignOp.setError(msg);
      return { success: false, error: msg };
    } finally {
      assignOp.setLoading(false);
    }
  }, [authRequest]);

  // ── 16. Get deleted (trash) assignments ─────────────────────────────────────
  const getDeletedAssignments = useCallback(async (filters = {}) => {
    fetchOp.setLoading(true);
    fetchOp.setError(null);
    try {
      const qs = buildParams(filters);
      const res = await authRequest("GET", `/assignments/deleted${qs ? `?${qs}` : ""}`);
      if (res?.success) {
        return {
          success: true,
          assignments: res.assignments || [],
          pagination: res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
        };
      }
      const msg = res?.message || "Failed to fetch deleted assignments";
      fetchOp.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to fetch deleted assignments");
      fetchOp.setError(msg);
      return { success: false, error: msg };
    } finally {
      fetchOp.setLoading(false);
    }
  }, [authRequest]);

  // ── Clear helpers ─────────────────────────────────────────────────────────
  const clearAssign = assignOp.clear;
  const clearFetch = fetchOp.clear;
  const clearDelete = deleteOp.clear;
  const clearRestore = restoreOp.clear;
  const clearStats = statsOp.clear;
  const clearDetail = detailOp.clear;
  const clearSub = subOp.clear;

  const clearAllStates = useCallback(() => {
    assignOp.clear();
    fetchOp.clear();
    deleteOp.clear();
    restoreOp.clear();
    statsOp.clear();
    detailOp.clear();
    subOp.clear();
  }, [assignOp, fetchOp, deleteOp, restoreOp, statsOp, detailOp, subOp]);

  // ── Context value ─────────────────────────────────────────────────────────
  const value = {
    // ── Loading / error / success states ──────────────────────────────────
    assignLoading: assignOp.loading,
    assignError: assignOp.error,
    assignSuccess: assignOp.success,

    fetchLoading: fetchOp.loading,
    fetchError: fetchOp.error,

    deleteLoading: deleteOp.loading,
    deleteError: deleteOp.error,
    deleteSuccess: deleteOp.success,

    restoreLoading: restoreOp.loading,
    restoreError: restoreOp.error,
    restoreSuccess: restoreOp.success,

    statsLoading: statsOp.loading,
    statsError: statsOp.error,

    detailLoading: detailOp.loading,
    detailError: detailOp.error,

    subLoading: subOp.loading,
    subError: subOp.error,

    // ── Clear helpers ──────────────────────────────────────────────────────
    clearAssign,
    clearFetch,
    clearDelete,
    clearRestore,
    clearStats,
    clearDetail,
    clearSub,
    clearAllStates,

    // ── API methods ────────────────────────────────────────────────────────
    // Assign
    assignToAdmin,
    assignToTeam,
    reassignToAdmin,
    reassignToTeam,

    // Fetch
    getAssignments,
    getAssignmentById,
    getAssignmentAnalytics,
    getTeamProgress,
    getRecentSubmissions,
    getSubmissionById,
    getAssignmentStats,
    getDeletedAssignments,

    // Mutate
    softDeleteAssignment,
    restoreAssignment,
    bulkRestoreAssignments,
    bulkDeleteAssignments,
  };

  return (
    <AssignmentContext.Provider value={value}>
      {children}
    </AssignmentContext.Provider>
  );
};

// ✅ FIXED: Proper export
export default AssignmentContext;