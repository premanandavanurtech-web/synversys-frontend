// src/context/DepartmentContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./AuthContexts";

const DepartmentContext = createContext();

export const useDepartment = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error("useDepartment must be used within a DepartmentProvider");
  }
  return context;
};

export const DepartmentProvider = ({ children }) => {
  const {
    get,
    post,
    put,
    delete: del,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
  } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Check if user has permission to manage departments
  const canManageDepartments = useMemo(() => {
    return isAuthenticated && (isAdmin() || isSuperAdmin());
  }, [isAuthenticated, isAdmin, isSuperAdmin]);

  // Fetch all departments
  const fetchDepartments = useCallback(
    async (options = {}, silent = false) => {
      if (!canManageDepartments && !silent) {
        setError("You don't have permission to view departments");
        return { success: false, error: "Permission denied" };
      }

      if (!silent) setLoading(true);
      setError(null);

      const page = options.page || pagination.page;
      const limit = options.limit || pagination.limit;
      const search = options.search || "";
      const sort = options.sort || "createdAt";
      const order = options.order || "desc";

      try {
        let url = `/departments?page=${page}&limit=${limit}&sort=${sort}&order=${order}`;
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }

        const response = await get(url);

        if (response.success) {
          setDepartments(response.departments || []);
          setPagination(
            response.pagination || {
              page: page,
              limit: limit,
              total: response.departments?.length || 0,
              pages: 1,
            },
          );
          return {
            success: true,
            departments: response.departments,
            pagination: response.pagination,
          };
        } else {
          throw new Error(response.message || "Failed to fetch departments");
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Error fetching departments";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [canManageDepartments, get, pagination.page, pagination.limit],
  );

  // Get single department by ID
  const getDepartment = useCallback(
    async (departmentId) => {
      if (!canManageDepartments) {
        return { success: false, error: "Permission denied" };
      }

      setActionLoading(true);
      setError(null);

      try {
        const response = await get(`/departments/${departmentId}`);

        if (response.success) {
          return { success: true, department: response.department };
        } else {
          throw new Error(response.message || "Failed to fetch department");
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Error fetching department";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setActionLoading(false);
      }
    },
    [canManageDepartments, get],
  );

  // Create new department
  const createDepartment = useCallback(
    async (departmentData) => {
      if (!canManageDepartments) {
        return { success: false, error: "Permission denied" };
      }

      setActionLoading(true);
      setError(null);

      try {
        const response = await post("/departments", departmentData);

        if (response.success) {
          // Refresh the departments list
          await fetchDepartments(
            { page: pagination.page, limit: pagination.limit },
            true,
          );
          return {
            success: true,
            department: response.department,
            message: response.message,
          };
        } else {
          throw new Error(response.message || "Failed to create department");
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Error creating department";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setActionLoading(false);
      }
    },
    [
      canManageDepartments,
      post,
      fetchDepartments,
      pagination.page,
      pagination.limit,
    ],
  );

  // Update department
  const updateDepartment = useCallback(
    async (departmentId, departmentData) => {
      if (!canManageDepartments) {
        return { success: false, error: "Permission denied" };
      }

      setActionLoading(true);
      setError(null);

      try {
        const response = await put(
          `/departments/${departmentId}`,
          departmentData,
        );

        if (response.success) {
          // Refresh the departments list
          await fetchDepartments(
            { page: pagination.page, limit: pagination.limit },
            true,
          );
          return {
            success: true,
            department: response.department,
            message: response.message,
          };
        } else {
          throw new Error(response.message || "Failed to update department");
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Error updating department";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setActionLoading(false);
      }
    },
    [
      canManageDepartments,
      put,
      fetchDepartments,
      pagination.page,
      pagination.limit,
    ],
  );

  // Delete department - FIXED: using del function correctly
  const deleteDepartment = useCallback(
    async (departmentId) => {
      if (!canManageDepartments) {
        return { success: false, error: "Permission denied" };
      }

      setActionLoading(true);
      setError(null);

      try {
        // Make sure del is a function
        if (typeof del !== "function") {
          throw new Error("Delete function not available");
        }

        const response = await del(`/departments/${departmentId}`);

        if (response && response.success) {
          // Refresh the departments list
          await fetchDepartments(
            { page: pagination.page, limit: pagination.limit },
            true,
          );
          return {
            success: true,
            message: response.message || "Department deleted successfully",
          };
        } else {
          throw new Error(response?.message || "Failed to delete department");
        }
      } catch (err) {
        console.error("Delete department error:", err);
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Error deleting department";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setActionLoading(false);
      }
    },
    [
      canManageDepartments,
      del,
      fetchDepartments,
      pagination.page,
      pagination.limit,
    ],
  );

  // Toggle department status
  const toggleDepartmentStatus = useCallback(
    async (departmentId, currentStatus) => {
      if (!canManageDepartments) {
        return { success: false, error: "Permission denied" };
      }

      setActionLoading(true);
      setError(null);

      try {
        const response = await put(`/departments/${departmentId}`, {
          isActive: !currentStatus,
        });

        if (response.success) {
          await fetchDepartments(
            { page: pagination.page, limit: pagination.limit },
            true,
          );
          return { success: true, message: response.message };
        } else {
          throw new Error(
            response.message || "Failed to update department status",
          );
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Error updating department status";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setActionLoading(false);
      }
    },
    [
      canManageDepartments,
      put,
      fetchDepartments,
      pagination.page,
      pagination.limit,
    ],
  );

  // Bulk delete departments
  const bulkDeleteDepartments = useCallback(
    async (departmentIds) => {
      if (!canManageDepartments) {
        return { success: false, error: "Permission denied" };
      }

      setActionLoading(true);
      setError(null);

      try {
        const response = await post("/departments/bulk-delete", {
          departmentIds,
        });

        if (response.success) {
          await fetchDepartments(
            { page: pagination.page, limit: pagination.limit },
            true,
          );
          return { success: true, message: response.message };
        } else {
          throw new Error(response.message || "Failed to delete departments");
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Error deleting departments";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setActionLoading(false);
      }
    },
    [
      canManageDepartments,
      post,
      fetchDepartments,
      pagination.page,
      pagination.limit,
    ],
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      departments,
      loading,
      actionLoading,
      error,
      pagination,
      canManageDepartments,
      fetchDepartments,
      getDepartment,
      createDepartment,
      updateDepartment,
      deleteDepartment,
      toggleDepartmentStatus,
      bulkDeleteDepartments,
      clearError,
    }),
    [
      departments,
      loading,
      actionLoading,
      error,
      pagination,
      canManageDepartments,
      fetchDepartments,
      getDepartment,
      createDepartment,
      updateDepartment,
      deleteDepartment,
      toggleDepartmentStatus,
      bulkDeleteDepartments,
      clearError,
    ],
  );

  return (
    <DepartmentContext.Provider value={value}>
      {children}
    </DepartmentContext.Provider>
  );
};
