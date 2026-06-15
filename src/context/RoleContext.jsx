// src/context/RoleContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./AuthContexts";

const RoleContext = createContext();

export const useRoles = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRoles must be used within a RoleProvider");
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const { token, isAuthenticated, isAdmin, isSuperAdmin, get, post, put, del } =
    useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Check if user has permission to manage roles
  const canManageRoles = useMemo(() => {
    return isAuthenticated && (isAdmin() || isSuperAdmin());
  }, [isAuthenticated, isAdmin, isSuperAdmin]);

  // Fetch all roles with pagination and search
  const fetchRoles = useCallback(
    async (options = {}) => {
      if (!canManageRoles) {
        setError("You don't have permission to view roles");
        return { success: false, error: "Permission denied" };
      }

      setLoading(true);
      setError(null);

      const page = options.page || pagination.page;
      const limit = options.limit || pagination.limit;
      const search = options.search || "";

      try {
        let url = `/roles?page=${page}&limit=${limit}`;
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }

        const response = await get(url);

        if (response.success) {
          setRoles(response.roles || []);
          setPagination(
            response.pagination || {
              page: page,
              limit: limit,
              total: response.roles?.length || 0,
              pages: 1,
            },
          );
          return {
            success: true,
            roles: response.roles,
            pagination: response.pagination,
          };
        } else {
          throw new Error(response.message || "Failed to fetch roles");
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || err.message || "Error fetching roles";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [canManageRoles, get, pagination.page, pagination.limit],
  );

  // Get single role by ID
  const getRole = useCallback(
    async (roleId) => {
      if (!canManageRoles) {
        return { success: false, error: "Permission denied" };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await get(`/roles/${roleId}`);

        if (response.success) {
          return { success: true, role: response.role };
        } else {
          throw new Error(response.message || "Failed to fetch role");
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || err.message || "Error fetching role";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [canManageRoles, get],
  );

  // Create new role
  const createRole = useCallback(
    async (roleData) => {
      if (!canManageRoles) {
        return { success: false, error: "Permission denied" };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await post("/roles", roleData);

        if (response.success) {
          // Refresh the roles list
          await fetchRoles({ page: pagination.page, limit: pagination.limit });
          return {
            success: true,
            role: response.role,
            message: response.message,
          };
        } else {
          throw new Error(response.message || "Failed to create role");
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || err.message || "Error creating role";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [canManageRoles, post, fetchRoles, pagination.page, pagination.limit],
  );

  // Update role
  const updateRole = useCallback(
    async (roleId, roleData) => {
      if (!canManageRoles) {
        return { success: false, error: "Permission denied" };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await put(`/roles/${roleId}`, roleData);

        if (response.success) {
          // Refresh the roles list
          await fetchRoles({ page: pagination.page, limit: pagination.limit });
          return {
            success: true,
            role: response.role,
            message: response.message,
          };
        } else {
          throw new Error(response.message || "Failed to update role");
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || err.message || "Error updating role";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [canManageRoles, put, fetchRoles, pagination.page, pagination.limit],
  );

  // Delete role
  const deleteRole = useCallback(
    async (roleId) => {
      if (!canManageRoles) {
        return { success: false, error: "Permission denied" };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await del(`/roles/${roleId}`);

        if (response.success) {
          // Refresh the roles list
          await fetchRoles({ page: pagination.page, limit: pagination.limit });
          return { success: true, message: response.message };
        } else {
          throw new Error(response.message || "Failed to delete role");
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || err.message || "Error deleting role";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [canManageRoles, del, fetchRoles, pagination.page, pagination.limit],
  );

  // Toggle role status (activate/deactivate)
  const toggleRoleStatus = useCallback(
    async (roleId, currentStatus) => {
      if (!canManageRoles) {
        return { success: false, error: "Permission denied" };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await put(`/roles/${roleId}`, {
          isActive: !currentStatus,
        });

        if (response.success) {
          // Refresh the roles list
          await fetchRoles({ page: pagination.page, limit: pagination.limit });
          return { success: true, message: response.message };
        } else {
          throw new Error(response.message || "Failed to update role status");
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Error updating role status";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [canManageRoles, put, fetchRoles, pagination.page, pagination.limit],
  );

  // Export roles
  const exportRoles = useCallback(
    async (format = "csv") => {
      if (!canManageRoles) {
        return { success: false, error: "Permission denied" };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await get(`/roles/export?format=${format}`);
        return { success: true, data: response.data, roles: response.roles };
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || err.message || "Error exporting roles";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [canManageRoles, get],
  );

  // Bulk delete roles
  const bulkDeleteRoles = useCallback(
    async (roleIds) => {
      if (!canManageRoles) {
        return { success: false, error: "Permission denied" };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await post("/roles/bulk-delete", { roleIds });

        if (response.success) {
          // Refresh the roles list
          await fetchRoles({ page: pagination.page, limit: pagination.limit });
          return { success: true, message: response.message };
        } else {
          throw new Error(response.message || "Failed to delete roles");
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || err.message || "Error deleting roles";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [canManageRoles, post, fetchRoles, pagination.page, pagination.limit],
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      roles,
      loading,
      error,
      pagination,
      canManageRoles,
      fetchRoles,
      getRole,
      createRole,
      updateRole,
      deleteRole,
      toggleRoleStatus,
      exportRoles,
      bulkDeleteRoles,
      clearError,
      setError,
    }),
    [
      roles,
      loading,
      error,
      pagination,
      canManageRoles,
      fetchRoles,
      getRole,
      createRole,
      updateRole,
      deleteRole,
      toggleRoleStatus,
      exportRoles,
      bulkDeleteRoles,
      clearError,
    ],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};
