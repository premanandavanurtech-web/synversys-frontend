// context/TeamContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContexts";
import axios from "axios";

const TeamContext = createContext();

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) throw new Error("useTeam must be used within a TeamProvider");
  return context;
};

const API_BASE_URL = "https://synversys-backend.onrender.com/api/v1";

const getAccessToken = () =>
  localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

const authHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getApiErrorMessage = (err, fallback) =>
  err.response?.data?.errors?.[0]?.message ||
  err.response?.data?.message ||
  fallback;

// ── NEW: sort param applied to every /team list request so newly-created
// members show first. "-createdAt" is the common Mongo/Express convention
// for "createdAt descending". If your backend uses a different query param
// name (e.g. sortBy=createdAt&order=desc), change buildSortParams() below —
// it's the single place this is wired up.
const buildSortParams = (params) => {
  params.append("sort", "-createdAt");
};

export const TeamProvider = ({ children }) => {
  const { token, isAuthenticated, user, logout } = useAuth();

  // ── Profile state ──
  const [profile, setProfile] = useState(null);

  // ── Team members state ──
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamStats, setTeamStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    inactive: 0,
    avgPerformanceScore: 0,
    totalInspections: 0,
    totalAssigned: 0,
    byRole: {},
    byDepartment: {},
    byLocation: {},
  });
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemberDetails, setSelectedMemberDetails] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // ── Dropdown data ──
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);

  // ── Filter state (used by TeamManagement for debounced fetching) ──
  const [activeFilters, setActiveFilters] = useState({
    search: "",
    role: "all",
    status: "all",
    page: 1,
    limit: 10,
  });

  // ── Loading states ──
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const initializedRef = useRef(false);
  const authRef = useRef({ token, isAuthenticated, user });
  const filterFetchRef = useRef(null);

  useEffect(() => {
    authRef.current = { token, isAuthenticated, user };
  }, [token, isAuthenticated, user]);

  // ── Auth error handler ──
  const handleAuthError = useCallback((err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      setError(
        err.response?.status === 403
          ? err.response?.data?.message || "Access denied."
          : "Session expired. Please login again.",
      );
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
      return true;
    }
    return false;
  }, []);

  // ─── Utilities ─────────────────────────────────────────────────────────────

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const formatJoinDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const diffDays = Math.ceil(
      Math.abs(new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) {
      const m = Math.floor(diffDays / 30);
      return `${m} month${m > 1 ? "s" : ""} ago`;
    }
    const y = Math.floor(diffDays / 365);
    return `${y} year${y > 1 ? "s" : ""} ago`;
  }, []);

  const getProfileInitials = useCallback(() => {
    if (profile?.firstName && profile?.lastName)
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
    return profile?.email?.charAt(0).toUpperCase() || "?";
  }, [profile]);

  const getFullName = useCallback(() => {
    if (profile?.firstName && profile?.lastName)
      return `${profile.firstName} ${profile.lastName}`;
    return profile?.email?.split("@")[0] || "Team Member";
  }, [profile]);

  const clearError = useCallback(() => setError(null), []);
  const clearCache = useCallback(() => {
    setTeamMembers([]);
    setError(null);
  }, []);

  // ─── Profile APIs ───────────────────────────────────────────────────────────

  const fetchTeamProfile = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) return null;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/team/me/profile`, {
        headers: authHeaders(),
      });
      if (response.data.success) {
        const p = response.data.profile;
        const enriched = {
          ...p,
          firstName: p.firstName || "",
          lastName: p.lastName || "",
          email: p.email || "",
          phone: p.phone || "",
          bio: p.bio || "",
          status: p.status || "inactive",
          joinDate: p.joinDate || p.createdAt,
          lastActiveAt: p.lastActiveAt || p.lastLogin,
          teamRole: p.teamRole || "",
          assignedCount: p.assignedCount || 0,
          completedCount: p.completedCount || 0,
          onTimeRate: p.onTimeRate || 0,
          qualityScore: p.qualityScore || 0,
          performanceScore: p.performanceScore || 0,
          inspectionsThisMonth: p.inspectionsThisMonth || 0,
        };
        setProfile(enriched);
        return enriched;
      }
      return null;
    } catch (err) {
      handleAuthError(err);
      setError(err.response?.data?.message || "Failed to fetch profile");
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  const updateTeamProfile = useCallback(
    async (profileData) => {
      const accessToken = getAccessToken();
      if (!accessToken) return { success: false, error: "Not authenticated" };
      setActionLoading(true);
      setError(null);
      try {
        const response = await axios.patch(
          `${API_BASE_URL}/team/me/profile`,
          profileData,
          { headers: authHeaders() },
        );
        if (response.data.success) {
          setProfile((prev) => ({ ...prev, ...response.data.profile }));
          return {
            success: true,
            message: response.data.message || "Profile updated successfully",
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to update profile",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to update profile",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [handleAuthError],
  );

  const uploadTeamAvatar = useCallback(
    async (file) => {
      const accessToken = getAccessToken();
      if (!accessToken) return { success: false, error: "Not authenticated" };
      if (!file) return { success: false, error: "Please choose an image" };

      setActionLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("avatar", file);

        const response = await axios.post(
          `${API_BASE_URL}/team/me/avatar`,
          formData,
          {
            headers: {
              ...authHeaders(),
              "Content-Type": "multipart/form-data",
            },
          },
        );

        if (response.data.success) {
          const nextProfile = response.data.profile || response.data.data?.profile;
          if (nextProfile) setProfile(nextProfile);
          return {
            success: true,
            message: response.data.message || "Profile image updated successfully",
            avatarUrl: response.data.avatarUrl || response.data.data?.avatarUrl,
          };
        }

        return {
          success: false,
          error: response.data.message || "Failed to upload profile image",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error:
            err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to upload profile image",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [handleAuthError],
  );

  const changePassword = useCallback(
    async (currentPassword, newPassword, confirmPassword) => {
      if (newPassword !== confirmPassword)
        return { success: false, error: "New passwords do not match" };
      if (newPassword.length < 6)
        return {
          success: false,
          error: "Password must be at least 6 characters",
        };
      setActionLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/team/me/change-password`,
          { currentPassword, newPassword, confirmPassword },
          { headers: authHeaders() },
        );
        if (response.data.success)
          return {
            success: true,
            message: response.data.message || "Password changed successfully",
          };
        return {
          success: false,
          error: response.data.message || "Failed to change password",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to change password",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [handleAuthError],
  );

  // ─── Dropdown fetches (roles, departments, locations from GET /team response) ──

  const fetchRoles = useCallback(async (options = {}, silent = false) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/roles`, {
        headers: authHeaders(),
        params: { page: 1, limit: options.limit || 100 },
      });
      if (response.data.success) {
        const list = response.data.roles || [];
        setRoles(list);
        return { success: true, roles: list };
      }
      return { success: false, roles: [] };
    } catch (err) {
      console.warn("fetchRoles error:", err.message);
      return { success: false, roles: [] };
    }
  }, []);

  const fetchDepartments = useCallback(async (options = {}, silent = false) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/departments`, {
        headers: authHeaders(),
        params: { page: 1, limit: options.limit || 100 },
      });
      if (response.data.success) {
        const list = response.data.departments || [];
        setDepartments(list);
        return { success: true, departments: list };
      }
      return { success: false, departments: [] };
    } catch (err) {
      console.warn("fetchDepartments error:", err.message);
      return { success: false, departments: [] };
    }
  }, []);

  const fetchLocations = useCallback(async (options = {}, silent = false) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/locations`, {
        headers: authHeaders(),
        params: { page: 1, limit: options.limit || 100 },
      });
      if (response.data.success) {
        const list = response.data.locations || [];
        setLocations(list);
        return { success: true, locations: list };
      }
      return { success: false, locations: [] };
    } catch (err) {
      console.warn("fetchLocations error:", err.message);
      return { success: false, locations: [] };
    }
  }, []);

  // ─── Team Member Management APIs ────────────────────────────────────────────

  /**
   * updateFilters — called by TeamManagement debounce effect.
   * Stores the filter state and triggers a fetch.
   * NEW: always requests newest-first ordering via buildSortParams().
   */
  const updateFilters = useCallback(
    async (filters) => {
      setActiveFilters(filters);
      const accessToken = getAccessToken();
      if (!accessToken) return;

      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append("page", filters.page || 1);
        params.append("limit", filters.limit || 10);
        if (filters.search) params.append("search", filters.search);
        if (filters.role && filters.role !== "all")
          params.append("role", filters.role);
        if (filters.status && filters.status !== "all")
          params.append("status", filters.status);
        buildSortParams(params); // NEW: newest-first sort

        const response = await axios.get(
          `${API_BASE_URL}/team?${params.toString()}`,
          {
            headers: authHeaders(),
          },
        );

        if (response.data.success) {
          const members = response.data.members || [];
          const paginationData = response.data.pagination || {};

          // Also seed dropdowns from the filters block if present
          const filtersBlock = response.data.filters || {};
          if (filtersBlock.availableRoles?.length && roles.length === 0) {
            setRoles(
              filtersBlock.availableRoles.map((r) => ({
                _id: r.value,
                id: r.value,
                name: r.label,
                description: r.description,
              })),
            );
          }
          if (
            filtersBlock.availableDepartments?.length &&
            departments.length === 0
          ) {
            setDepartments(
              filtersBlock.availableDepartments.map((d) => ({
                _id: d.value,
                id: d.value,
                name: d.label,
                description: d.description,
              })),
            );
          }
          if (
            filtersBlock.availableLocations?.length &&
            locations.length === 0
          ) {
            setLocations(
              filtersBlock.availableLocations.map((l) => ({
                _id: l.value,
                id: l.value,
                name: l.label,
                description: l.description,
              })),
            );
          }

          setTeamMembers(members);
          setPagination({
            page: paginationData.page || filters.page || 1,
            limit: paginationData.limit || filters.limit || 10,
            total: paginationData.total || members.length,
            pages: paginationData.pages || paginationData.totalPages || 1,
          });
        }
      } catch (err) {
        handleAuthError(err);
        setError(err.response?.data?.message || "Failed to fetch team members");
      } finally {
        setLoading(false);
      }
    },
    [handleAuthError, roles.length, departments.length, locations.length],
  );

  // GET /team (with query params) — NEW: also sorted newest-first
  const fetchTeamMembers = useCallback(
    async (page = 1, limit = 10, filters = {}) => {
      const accessToken = getAccessToken();
      if (!accessToken) return { success: false, error: "Not authenticated" };
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", limit);
        if (filters.role && filters.role !== "all")
          params.append("role", filters.role);
        if (filters.department) params.append("department", filters.department);
        if (filters.location) params.append("location", filters.location);
        if (filters.status && filters.status !== "all")
          params.append("status", filters.status);
        if (filters.search) params.append("search", filters.search);
        buildSortParams(params); // NEW: newest-first sort

        const response = await axios.get(
          `${API_BASE_URL}/team?${params.toString()}`,
          { headers: authHeaders() },
        );
        if (response.data.success) {
          const members = response.data.members || [];
          const paginationData = response.data.pagination || {};
          setTeamMembers(members);
          setPagination({
            page: paginationData.page || page,
            limit: paginationData.limit || limit,
            total: paginationData.total || members.length,
            pages: paginationData.pages || 1,
          });
          return { success: true, members, pagination: paginationData };
        }
        return {
          success: false,
          error: response.data.message || "Failed to fetch team members",
        };
      } catch (err) {
        handleAuthError(err);
        const msg =
          err.response?.data?.message || "Failed to fetch team members";
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [handleAuthError],
  );

  // GET /team/stats
  const fetchTeamStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/team/stats`, {
        headers: authHeaders(),
      });
      if (response.data.success) {
        const s = response.data.stats || {};
        setTeamStats({
          total: s.total || 0,
          active: s.active || 0,
          onLeave: s.onLeave || 0,
          inactive: s.inactive || 0,
          avgPerformanceScore: s.avgPerformanceScore || 0,
          totalInspections: s.totalInspections || 0,
          totalAssigned: s.totalAssigned || 0,
          byRole: s.byRole || {},
          byDepartment: s.byDepartment || {},
          byLocation: s.byLocation || {},
        });
        return { success: true, stats: s };
      }
      return { success: false };
    } catch (err) {
      handleAuthError(err);
      return {
        success: false,
        error: err.response?.data?.message || "Failed to fetch stats",
      };
    }
  }, [handleAuthError]);

  // GET /team/:id
  const fetchTeamMemberById = useCallback(
    async (memberId) => {
      const accessToken = getAccessToken();
      if (!accessToken) return { success: false, error: "Not authenticated" };
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/team/${memberId}`, {
          headers: authHeaders(),
        });
        if (response.data.success) {
          const member = response.data.member;
          setSelectedMember(member);
          return { success: true, member };
        }
        return {
          success: false,
          error: response.data.message || "Failed to fetch member",
        };
      } catch (err) {
        handleAuthError(err);
        const msg = err.response?.data?.message || "Failed to fetch member";
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [handleAuthError],
  );

  /**
   * fetchTeamMemberDetails — enriches single member data for the Details page.
   * Maps the raw API response (GET /team/:id) into the shape TeamMemberDetails expects.
   */
  const fetchTeamMemberDetails = useCallback(
    async (memberId) => {
      const accessToken = getAccessToken();
      if (!accessToken) return { success: false, error: "Not authenticated" };
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/team/${memberId}`, {
          headers: authHeaders(),
        });
        if (response.data.success) {
          const raw = response.data.member;

          const enriched = {
            personalInfo: {
              firstName: raw.firstName || "",
              lastName: raw.lastName || "",
              email: raw.email || "",
              phone: raw.phone || "",
              bio: raw.bio || "",
              status: raw.status || "active",
              teamRole: raw.teamRole || raw.role || "",
              roleDisplay: raw.teamRoleDisplay || raw.teamRole || "",
              department: raw.department || "",
              location: raw.location || "",
              joinDate: raw.joinDate || raw.teamCreatedAt || raw.createdAt,
            },
            stats: {
              totalInspections: raw.assignedCount || 0,
              thisMonth: raw.inspectionsThisMonth || 0,
              onTimeRate: raw.onTimeRate || 0,
              qualityScore: raw.qualityScore || 0,
              performanceScore: raw.performanceScore || 0,
              completedCount: raw.completedCount || 0,
              assignedCount: raw.assignedCount || 0,
            },
            monthlyPerformance: raw.monthlyPerformance || [],
            certifications: raw.certifications || [],
            recentInspections: (raw.recentSubmissions || []).map((s) => ({
              id: s.id,
              assetName: s.checklists?.[0]?.checklistName || "Inspection",
              type: s.checklists?.[0]?.checklistName || "—",
              location: raw.location || "—",
              date: s.submittedAt,
              status:
                s.reviewStatus === "pending_review"
                  ? "Pending Review"
                  : "Completed",
            })),
            assignedAssets: (raw.assignedChecklists || []).map((c) => ({
              assignmentId: c.assignmentId || c._id,
              asset: {
                assetName: c.checklistName || "Asset",
                currentLocation: raw.location || "—",
              },
              type: c.type || "Checklist",
              dueDate: c.dueDate,
            })),
            taskSummary: {
              dueToday: raw.taskSummary?.dueToday || 0,
              dueTomorrow: raw.taskSummary?.dueTomorrow || 0,
              dueThisWeek: raw.taskSummary?.dueThisWeek || 0,
            },
          };

          setSelectedMemberDetails(enriched);
          return { success: true, member: enriched };
        }
        return {
          success: false,
          error: response.data.message || "Member not found",
        };
      } catch (err) {
        handleAuthError(err);
        const msg =
          err.response?.data?.message || "Failed to fetch member details";
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [handleAuthError],
  );

  // POST /team
  const addTeamMember = useCallback(
    async (formData) => {
      const accessToken = getAccessToken();
      if (!accessToken) return { success: false, error: "Not authenticated" };
      setActionLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${API_BASE_URL}/team`, formData, {
          headers: authHeaders(),
        });
        if (response.data.success) {
          // NEW: force page back to 1 so the just-created member (now
          // sorted first by the backend) is visible immediately.
          await updateFilters({ ...activeFilters, page: 1 });
          return {
            success: true,
            message: response.data.message || "Team member added successfully",
            member: response.data.member,
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to add team member",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: getApiErrorMessage(err, "Failed to add team member"),
        };
      } finally {
        setActionLoading(false);
      }
    },
    [handleAuthError, updateFilters, activeFilters],
  );

  // PUT /team/:id
  const updateTeamMember = useCallback(
    async (memberId, updateData) => {
      const accessToken = getAccessToken();
      if (!accessToken) return { success: false, error: "Not authenticated" };
      setActionLoading(true);
      setError(null);
      try {
        const response = await axios.put(
          `${API_BASE_URL}/team/${memberId}`,
          updateData,
          { headers: authHeaders() },
        );
        if (response.data.success) {
          await updateFilters({ ...activeFilters });
          return {
            success: true,
            message:
              response.data.message || "Team member updated successfully",
            member: response.data.member,
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to update team member",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to update team member",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [handleAuthError, updateFilters, activeFilters],
  );

  // DELETE /team/:id
  const deleteTeamMember = useCallback(
    async (memberId, permanent = false) => {
      const accessToken = getAccessToken();
      if (!accessToken) return { success: false, error: "Not authenticated" };
      setActionLoading(true);
      setError(null);
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/team/${memberId}`,
          {
            headers: authHeaders(),
            params: { permanent },
          },
        );
        if (response.data.success) {
          setTeamMembers((prev) =>
            prev.filter((m) => (m.id || m._id) !== memberId),
          );
          return {
            success: true,
            message:
              response.data.message || "Team member deleted successfully",
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to delete team member",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to delete team member",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [handleAuthError],
  );

  // PATCH /team/:id/status
  const updateMemberStatus = useCallback(
    async (memberId, status) => {
      const accessToken = getAccessToken();
      if (!accessToken) return { success: false, error: "Not authenticated" };
      setActionLoading(true);
      setError(null);
      try {
        const response = await axios.patch(
          `${API_BASE_URL}/team/${memberId}/status`,
          { status },
          { headers: authHeaders() },
        );
        if (response.data.success) {
          setTeamMembers((prev) =>
            prev.map((m) =>
              (m.id || m._id) === memberId ? { ...m, status } : m,
            ),
          );
          return {
            success: true,
            message: response.data.message || "Status updated successfully",
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to update status",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to update status",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [handleAuthError],
  );

  // ─── Initial load ────────────────────────────────────────────────────────────

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken || !isAuthenticated) {
      initializedRef.current = false;
      return;
    }
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (user?.role === "team") {
      fetchTeamProfile();
    }
  }, [isAuthenticated, user?.role, fetchTeamProfile]);

  const value = {
    // State
    profile,
    loading,
    actionLoading,
    error,
    teamMembers,
    teamStats,
    selectedMember,
    selectedMemberDetails,
    pagination,
    roles,
    departments,
    locations,

    // Profile
    fetchTeamProfile,
    updateTeamProfile,
    uploadTeamAvatar,
    changePassword,
    fetchTeamMembers,
    fetchTeamStats,
    fetchTeamMemberById,
    fetchTeamMemberDetails,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    updateMemberStatus,
    setSelectedMember,
    clearCache,
    fetchRoles,
    fetchDepartments,
    fetchLocations,
    updateFilters,
    formatDate,
    formatJoinDate,
    formatDateTime,
    getFullName,
    getInitials: getProfileInitials,
    clearError,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};