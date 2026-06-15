// context/AssignmentContext.jsx - Complete fixed version

import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContexts";

const AssignmentContext = createContext();

export const useAssignment = () => {
  const ctx = useContext(AssignmentContext);
  if (!ctx)
    throw new Error("useAssignment must be used within AssignmentProvider");
  return ctx;
};

const useOpState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const clear = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);
  return { loading, setLoading, error, setError, success, setSuccess, clear };
};

export const AssignmentProvider = ({ children }) => {
  const { authRequest } = useAuth();

  const assign = useOpState();
  const fetch = useOpState();
  const del = useOpState();
  const restore = useOpState();
  const stats = useOpState();

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

  // 1. ASSIGN TO ADMIN
  const assignToAdmin = useCallback(
    async (data) => {
      assign.setLoading(true);
      assign.setError(null);
      try {
        if (!data.checklistIds?.length)
          throw new Error("At least one checklist is required");
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

        const res = await authRequest(
          "POST",
          "/assignments/assign-to-admin",
          payload,
        );
        if (res?.success) {
          assign.setSuccess("Checklist(s) assigned to admin successfully!");
          return {
            success: true,
            data: res.assignment || res.data,
            message: res.message,
          };
        }
        const msg = res?.message || "Assignment failed";
        assign.setError(msg);
        return { success: false, error: msg };
      } catch (err) {
        const msg = extractError(err, "Failed to assign to admin");
        assign.setError(msg);
        return { success: false, error: msg };
      } finally {
        assign.setLoading(false);
      }
    },
    [authRequest],
  );

  // 2. ASSIGN TO TEAM
  const assignToTeam = useCallback(
    async (data) => {
      assign.setLoading(true);
      assign.setError(null);
      try {
        if (!data.teamMemberIds?.length)
          throw new Error("At least one team member is required");
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

        const res = await authRequest(
          "POST",
          "/assignments/assign-to-team",
          payload,
        );
        if (res?.success) {
          assign.setSuccess("Assignment created successfully!");
          return {
            success: true,
            data: res.assignment || res.data,
            message: res.message,
          };
        }
        const msg = res?.message || "Assignment failed";
        assign.setError(msg);
        return { success: false, error: msg };
      } catch (err) {
        const msg = extractError(err, "Failed to assign to team");
        assign.setError(msg);
        return { success: false, error: msg };
      } finally {
        assign.setLoading(false);
      }
    },
    [authRequest],
  );

  // 3. GET ALL ASSIGNMENTS
  const getAssignments = useCallback(
    async (filters = {}) => {
      fetch.setLoading(true);
      fetch.setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.page) params.append("page", filters.page);
        if (filters.limit) params.append("limit", filters.limit);
        if (filters.status) params.append("status", filters.status);
        if (filters.priority) params.append("priority", filters.priority);
        if (filters.search) params.append("search", filters.search);
        if (filters.assignedTo) params.append("assignedTo", filters.assignedTo);
        if (filters.fromDate) params.append("fromDate", filters.fromDate);
        if (filters.toDate) params.append("toDate", filters.toDate);
        if (filters.assignmentType)
          params.append("assignmentType", filters.assignmentType);

        const url = `/assignments${params.toString() ? `?${params}` : ""}`;
        const res = await authRequest("GET", url);
        if (res?.success) {
          return {
            success: true,
            assignments: res.assignments || [],
            pagination: res.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 1,
            },
            stats: res.stats || null,
          };
        }
        const msg = res?.message || "Failed to fetch assignments";
        fetch.setError(msg);
        return { success: false, error: msg };
      } catch (err) {
        const msg = extractError(err, "Failed to fetch assignments");
        fetch.setError(msg);
        return { success: false, error: msg };
      } finally {
        fetch.setLoading(false);
      }
    },
    [authRequest],
  );

  // 4. GET ASSIGNMENT STATS
  const getAssignmentStats = useCallback(async () => {
    stats.setLoading(true);
    stats.setError(null);
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
      stats.setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const msg = extractError(err, "Failed to fetch assignment stats");
      stats.setError(msg);
      return { success: false, error: msg };
    } finally {
      stats.setLoading(false);
    }
  }, [authRequest]);

  // 6. SOFT DELETE
  const softDeleteAssignment = useCallback(
    async (assignmentId) => {
      del.setLoading(true);
      del.setError(null);
      try {
        const res = await authRequest(
          "DELETE",
          `/assignments/${assignmentId}/soft`,
        );
        if (res?.success) {
          del.setSuccess("Assignment moved to trash!");
          return { success: true, message: res.message };
        }
        const msg = res?.message || "Failed to delete assignment";
        del.setError(msg);
        return { success: false, error: msg };
      } catch (err) {
        const msg = extractError(err, "Failed to delete assignment");
        del.setError(msg);
        return { success: false, error: msg };
      } finally {
        del.setLoading(false);
      }
    },
    [authRequest],
  );

  // 8. REASSIGN TO ADMIN - FIXED: matches API spec
  const reassignToAdmin = useCallback(
    async (assignmentId, data) => {
      assign.setLoading(true);
      assign.setError(null);
      try {
        if (!assignmentId) throw new Error("Assignment ID is required");
        if (!data.newAdminId) throw new Error("New Admin ID is required");

        const payload = {
          newAdminId: data.newAdminId,
        };
        if (data.dueDate) payload.dueDate = fmtDate(data.dueDate);
        if (data.priority) payload.priority = data.priority;
        if (data.notes?.trim()) payload.notes = data.notes.trim();
        if (data.reason?.trim()) payload.reason = data.reason.trim();

        const res = await authRequest(
          "PUT",
          `/assignments/${assignmentId}/reassign-to-admin`,
          payload,
        );
        if (res?.success) {
          assign.setSuccess("Re-assigned to admin successfully!");
          return { success: true, data: res.assignment || res.data };
        }
        const msg = res?.message || "Re-assignment failed";
        assign.setError(msg);
        return { success: false, error: msg };
      } catch (err) {
        const msg = extractError(err, "Failed to re-assign to admin");
        assign.setError(msg);
        return { success: false, error: msg };
      } finally {
        assign.setLoading(false);
      }
    },
    [authRequest],
  );

  // 9. REASSIGN TO TEAM - FIXED: API expects "teamMemberIds", not "newTeamMemberIds"
  const reassignToTeam = useCallback(
    async (assignmentId, data) => {
      assign.setLoading(true);
      assign.setError(null);
      try {
        if (!assignmentId) throw new Error("Assignment ID is required");
        if (!data.teamMemberIds?.length)
          throw new Error("At least one team member is required");

        const payload = {
          teamMemberIds: data.teamMemberIds, // FIXED: Use teamMemberIds as API expects
        };
        if (data.dueDate) payload.dueDate = fmtDate(data.dueDate);
        if (data.priority) payload.priority = data.priority;
        if (data.notes?.trim()) payload.notes = data.notes.trim();
        if (data.reason?.trim()) payload.reason = data.reason.trim();
        if (data.assetIds?.length) payload.assetIds = data.assetIds;

        const res = await authRequest(
          "PUT",
          `/assignments/${assignmentId}/reassign-to-team`,
          payload,
        );
        if (res?.success) {
          assign.setSuccess("Re-assigned to team successfully!");
          return { success: true, data: res.assignment || res.data };
        }
        const msg = res?.message || "Re-assignment failed";
        assign.setError(msg);
        return { success: false, error: msg };
      } catch (err) {
        const msg = extractError(err, "Failed to re-assign to team");
        assign.setError(msg);
        return { success: false, error: msg };
      } finally {
        assign.setLoading(false);
      }
    },
    [authRequest],
  );

  const clearAssign = assign.clear;
  const clearFetch = fetch.clear;
  const clearDelete = del.clear;
  const clearRestore = restore.clear;
  const clearStats = stats.clear;

  const clearAllStates = useCallback(() => {
    assign.clear();
    fetch.clear();
    del.clear();
    restore.clear();
    stats.clear();
  }, [assign, fetch, del, restore, stats]);

  const value = {
    // Loading states
    assignLoading: assign.loading,
    assignError: assign.error,
    assignSuccess: assign.success,
    fetchLoading: fetch.loading,
    fetchError: fetch.error,
    deleteLoading: del.loading,
    deleteError: del.error,
    restoreLoading: restore.loading,
    restoreError: restore.error,
    statsLoading: stats.loading,
    statsError: stats.error,

    // Clear functions
    clearAssign,
    clearFetch,
    clearDelete,
    clearRestore,
    clearStats,
    clearAllStates,

    // API methods
    assignToAdmin,
    assignToTeam,
    getAssignments,
    getAssignmentStats,
    softDeleteAssignment,
    reassignToAdmin,
    reassignToTeam,
  };

  return (
    <AssignmentContext.Provider value={value}>
      {children}
    </AssignmentContext.Provider>
  );
};

export default AssignmentContext;
