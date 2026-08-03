// context/ClientContext.jsx - Fixed Version

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContexts";

const API_BASE_URL = "https://synversys-backend.onrender.com/api/v1";

const getApiErrorMessage = (error, fallback) =>
  error.response?.data?.errors?.[0]?.message ||
  error.response?.data?.message ||
  fallback;

// Initial state
const initialState = {
  clients: [],
  totalClients: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  initialLoading: true,
  error: null,
  selectedClient: null,
  stats: {
    total: 0,
    active: 0,
    expiringSoon: 0,
    expiredCustomers: 0,
    pendingApprovalCustomers: 0,
    byPlan: {
      free: 0,
      standard: 0,
      premium: 0,
      enterprise: 0,
    },
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  },
  filters: {
    search: "",
    status: "all",
    membershipPlan: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 12,
  },
  actionLoading: false,
};

// Action types
const ACTION_TYPES = {
  SET_LOADING: "SET_LOADING",
  SET_INITIAL_LOADING: "SET_INITIAL_LOADING",
  SET_ACTION_LOADING: "SET_ACTION_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_CLIENTS: "SET_CLIENTS",
  SET_SELECTED_CLIENT: "SET_SELECTED_CLIENT",
  UPDATE_FILTERS: "UPDATE_FILTERS",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_STATS: "SET_STATS",
  SET_PAGINATION: "SET_PAGINATION",
  RESET_STATE: "RESET_STATE",
};

// Reducer function
const clientReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTION_TYPES.SET_INITIAL_LOADING:
      return { ...state, initialLoading: action.payload };
    case ACTION_TYPES.SET_ACTION_LOADING:
      return { ...state, actionLoading: action.payload };
    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        initialLoading: false,
        actionLoading: false,
      };
    case ACTION_TYPES.SET_CLIENTS:
      return {
        ...state,
        clients: action.payload.clients,
        totalClients: action.payload.total,
        currentPage: action.payload.page,
        loading: false,
        initialLoading: false,
        error: null,
        pagination: {
          ...state.pagination,
          page: action.payload.page,
          total: action.payload.total,
          pages: action.payload.pages,
          limit: action.payload.limit || state.pagination.limit,
        },
      };
    case ACTION_TYPES.SET_SELECTED_CLIENT:
      return { ...state, selectedClient: action.payload, loading: false };
    case ACTION_TYPES.UPDATE_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case ACTION_TYPES.CLEAR_ERROR:
      return { ...state, error: null };
    case ACTION_TYPES.SET_STATS:
      return { ...state, stats: action.payload };
    case ACTION_TYPES.SET_PAGINATION:
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      };
    case ACTION_TYPES.RESET_STATE:
      return {
        ...initialState,
        initialLoading: false,
      };
    default:
      return state;
  }
};

// Helper functions with improved token handling
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("accessToken");

  if (!token || token === "undefined" || token === "null" || token === "") {
    return null;
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const getToken = () => {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("accessToken");
  if (!token || token === "undefined" || token === "null" || token === "") {
    return null;
  }
  return token;
};

// Improved admin check that doesn't block API calls
const hasValidToken = (token = getToken()) => {
  if (!token) return false;
  
  try {
    // Check if token is expired
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp && decoded.exp < currentTime) {
      console.warn("Token expired");
      return false;
    }
    return true;
  } catch (e) {
    console.error("Error checking token validity:", e);
    return false;
  }
};

// Create Context
const ClientContext = createContext(null);

export const ClientProvider = ({ children }) => {
  const [state, dispatch] = useReducer(clientReducer, initialState);
  const {
    token: authToken,
    user,
    loading: authLoading,
    initialized: authInitialized,
    isAuthenticated,
  } = useAuth();
  const activeControllerRef = useRef(null);
  const initialLoadDone = useRef(false);
  const isFetchingRef = useRef(false);

  const clearError = useCallback(() => {
    dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: ACTION_TYPES.RESET_STATE });
  }, []);

  const getCurrentToken = useCallback(() => {
    return authToken || getToken();
  }, [authToken]);

  const hasCurrentValidToken = useCallback(() => {
    const currentToken = getCurrentToken();
    return hasValidToken(currentToken);
  }, [getCurrentToken]);

  const getCurrentAuthHeaders = useCallback(() => {
    const currentToken = getCurrentToken();
    if (!currentToken) {
      return null;
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentToken}`,
    };
  }, [getCurrentToken]);

  // Handle logout and redirect
  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    resetState();
    
    // Redirect to login if not already there
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }, [resetState]);

  // Get all clients
  const getAllClients = useCallback(
    async (params = {}) => {
      if (authLoading || !authInitialized) {
        return null;
      }

      const token = getCurrentToken();

      if (!isAuthenticated || !token || !hasCurrentValidToken()) {
        const errorMsg = "Authentication required. Please login again.";
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: errorMsg });
        dispatch({ type: ACTION_TYPES.SET_INITIAL_LOADING, payload: false });
        return null;
      }

      // Prevent multiple simultaneous requests
      if (isFetchingRef.current) {
        return null;
      }

      // Cancel previous request
      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
      }
      activeControllerRef.current = new AbortController();
      isFetchingRef.current = true;

      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

      try {
        const page = params.page || state.pagination.page;
        const limit = params.limit || state.pagination.limit;
        const search = params.search !== undefined ? params.search : state.filters.search;
        const status = params.status !== undefined ? params.status : state.filters.status;
        const membershipPlan = params.membershipPlan !== undefined
          ? params.membershipPlan
          : state.filters.membershipPlan;
        const expiringSoon = params.expiringSoon;
        const expired = params.expired;
        const pendingApproval = params.pendingApproval;
        const capacityAlerts = params.capacityAlerts;
        const sortBy = params.sortBy || state.filters.sortBy;
        const sortOrder = params.sortOrder || state.filters.sortOrder;

        const queryParams = new URLSearchParams();
        queryParams.append("page", page);
        queryParams.append("limit", limit);
        queryParams.append("sortBy", sortBy);
        queryParams.append("sortOrder", sortOrder);

        if (search && search !== "all" && search.trim()) {
          queryParams.append("search", search.trim());
        }
        if (status && status !== "all") queryParams.append("status", status);
        if (membershipPlan && membershipPlan !== "all")
          queryParams.append("membershipPlan", membershipPlan);
        if (expiringSoon === true || expiringSoon === "true")
          queryParams.append("expiringSoon", "true");
        if (expired === true || expired === "true")
          queryParams.append("expired", "true");
        if (pendingApproval === true || pendingApproval === "true")
          queryParams.append("pendingApproval", "true");
        if (capacityAlerts === true || capacityAlerts === "true")
          queryParams.append("capacityAlerts", "true");

        const url = `${API_BASE_URL}/clients?${queryParams.toString()}`;
        const headers = getCurrentAuthHeaders();

        if (!headers) {
          throw new Error("No authentication headers available");
        }

        const response = await axios.get(url, {
          headers,
          signal: activeControllerRef.current.signal,
        });

        // Handle different response structures
        const clientsData = response.data.clients || response.data.data?.clients || [];
        const paginationData = response.data.pagination || response.data.data?.pagination || {};
        const summaryData = response.data.summary || response.data.data?.summary || {};
        let activeCustomersTotal = summaryData.activeCustomers || summaryData.active || 0;

        if (!status || status === "all" || status === "active") {
          try {
            const activeCountParams = new URLSearchParams(queryParams);
            activeCountParams.set("page", "1");
            activeCountParams.set("limit", "1");
            activeCountParams.set("status", "active");

            const activeCountResponse = await axios.get(
              `${API_BASE_URL}/clients?${activeCountParams.toString()}`,
              {
                headers,
                signal: activeControllerRef.current.signal,
              },
            );

            const activePagination =
              activeCountResponse.data.pagination ||
              activeCountResponse.data.data?.pagination ||
              {};
            activeCustomersTotal =
              activePagination.total ?? activeCustomersTotal;
          } catch (countError) {
            if (!axios.isCancel(countError) && countError.name !== "CanceledError") {
              console.warn("Failed to fetch active customer total:", countError);
            }
          }
        } else {
          activeCustomersTotal = 0;
        }

        // Update stats
        dispatch({
          type: ACTION_TYPES.SET_STATS,
          payload: {
            total: summaryData.totalCustomers || summaryData.total || 0,
            active: activeCustomersTotal,
            expiringSoon: summaryData.expiringSoon || 0,
            expiredCustomers: summaryData.expiredCustomers || 0,
            pendingApprovalCustomers: summaryData.pendingApprovalCustomers || 0,
            byPlan: summaryData.byPlan || {
              free: 0,
              standard: 0,
              premium: 0,
              enterprise: 0,
            },
          },
        });

        // Update clients list
        dispatch({
          type: ACTION_TYPES.SET_CLIENTS,
          payload: {
            clients: clientsData,
            total: paginationData.total || clientsData.length,
            pages: paginationData.pages || 1,
            page: paginationData.page || parseInt(page),
            limit: paginationData.limit || parseInt(limit),
          },
        });

        return response.data;
      } catch (error) {
        if (axios.isCancel(error) || error.name === "CanceledError") {
          return null;
        }

        let errorMessage = "Failed to fetch clients";
        let shouldRedirect = false;

        if (error.response?.status === 401) {
          errorMessage = "Session expired. Please login again.";
          shouldRedirect = true;
        } else if (error.response?.status === 403) {
          errorMessage = error.response?.data?.message || 
                        "Access denied. You don't have permission to view clients.";
          console.error("403 Error Details:", {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
          });
        } else if (error.response?.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: errorMessage });
        
        if (shouldRedirect) {
          handleUnauthorized();
        }
        
        throw new Error(errorMessage);
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
        activeControllerRef.current = null;
        isFetchingRef.current = false;
      }
    },
    [
      state.pagination.page,
      state.pagination.limit,
      state.filters.search,
      state.filters.status,
      state.filters.membershipPlan,
      state.filters.sortBy,
      state.filters.sortOrder,
      authLoading,
      authInitialized,
      isAuthenticated,
      getCurrentToken,
      hasCurrentValidToken,
      getCurrentAuthHeaders,
      handleUnauthorized,
    ]
  );

  const fetchClients = useCallback(
    async (params = {}) => {
      if (authLoading || !authInitialized) {
        return null;
      }

      const token = getCurrentToken();
      if (!isAuthenticated || !token) {
        dispatch({
          type: ACTION_TYPES.SET_ERROR,
          payload: "Authentication required. Please login again.",
        });
        dispatch({ type: ACTION_TYPES.SET_INITIAL_LOADING, payload: false });
        return null;
      }
      return await getAllClients(params);
    },
    [authLoading, authInitialized, isAuthenticated, getCurrentToken, getAllClients]
  );

  const getClientById = useCallback(async (clientId) => {
    const token = getCurrentToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

    try {
      const response = await axios.get(`${API_BASE_URL}/clients/${clientId}`, {
        headers: getCurrentAuthHeaders(),
      });

      const clientData = response.data.client || response.data.data?.client || response.data;
      dispatch({
        type: ACTION_TYPES.SET_SELECTED_CLIENT,
        payload: clientData,
      });

      return response.data;
    } catch (error) {
      let errorMessage = "Failed to fetch client";
      
      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        handleUnauthorized();
      } else if (error.response?.status === 403) {
        errorMessage = "Access denied. You don't have permission to view this client.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
    }
  }, [getCurrentToken, getCurrentAuthHeaders, handleUnauthorized]);

  const addClient = useCallback(
    async (clientData) => {
      const token = getCurrentToken();
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      dispatch({ type: ACTION_TYPES.SET_ACTION_LOADING, payload: true });

      try {
        const response = await axios.post(
          `${API_BASE_URL}/clients`,
          clientData,
          { headers: getCurrentAuthHeaders() }
        );

        await fetchClients({ page: 1 });
        return response.data;
      } catch (error) {
        let errorMessage = getApiErrorMessage(error, "Failed to create client");
        
      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        handleUnauthorized();
      } else if (error.response?.status === 403) {
        errorMessage = getApiErrorMessage(error, "You don't have permission to create");
      }
        
        throw new Error(errorMessage);
      } finally {
        dispatch({ type: ACTION_TYPES.SET_ACTION_LOADING, payload: false });
      }
    },
    [getCurrentToken, getCurrentAuthHeaders, fetchClients, handleUnauthorized]
  );

  const editClient = useCallback(
    async (clientId, updateData) => {
      const token = getCurrentToken();
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      dispatch({ type: ACTION_TYPES.SET_ACTION_LOADING, payload: true });

      try {
        const response = await axios.put(
          `${API_BASE_URL}/clients/${clientId}`,
          updateData,
          { headers: getCurrentAuthHeaders() }
        );

        // Update selected client if it's the same
        if (state.selectedClient?._id === clientId || state.selectedClient?.id === clientId) {
          const updatedClient = response.data.client || response.data.data?.client;
          if (updatedClient) {
            dispatch({
              type: ACTION_TYPES.SET_SELECTED_CLIENT,
              payload: updatedClient,
            });
          }
        }

        await fetchClients();
        return response.data;
      } catch (error) {
        let errorMessage = "Failed to update client";
        
      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        handleUnauthorized();
      } else if (error.response?.status === 403) {
        errorMessage = getApiErrorMessage(error, "You don't have permission to edit");
      } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        throw new Error(errorMessage);
      } finally {
        dispatch({ type: ACTION_TYPES.SET_ACTION_LOADING, payload: false });
      }
    },
    [state.selectedClient, getCurrentToken, getCurrentAuthHeaders, fetchClients, handleUnauthorized]
  );

  const changeClientStatus = useCallback(
    async (clientId, status) => {
      const token = getCurrentToken();
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      dispatch({ type: ACTION_TYPES.SET_ACTION_LOADING, payload: true });

      try {
        const response = await axios.patch(
          `${API_BASE_URL}/clients/${clientId}/status`,
          { status },
          { headers: getCurrentAuthHeaders() }
        );

        await fetchClients();

        if (state.selectedClient?._id === clientId || state.selectedClient?.id === clientId) {
          await getClientById(clientId);
        }

        return response.data;
      } catch (error) {
        let errorMessage = "Failed to update status";
        
      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        handleUnauthorized();
      } else if (error.response?.status === 403) {
        errorMessage = getApiErrorMessage(error, "You don't have permission to edit");
      } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        throw new Error(errorMessage);
      } finally {
        dispatch({ type: ACTION_TYPES.SET_ACTION_LOADING, payload: false });
      }
    },
    [getCurrentToken, getCurrentAuthHeaders, fetchClients, getClientById, state.selectedClient, handleUnauthorized]
  );

  const deleteClient = useCallback(
    async (clientId) => {
      const token = getCurrentToken();
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      dispatch({ type: ACTION_TYPES.SET_ACTION_LOADING, payload: true });

      try {
        const response = await axios.delete(
          `${API_BASE_URL}/clients/${clientId}`,
          { headers: getCurrentAuthHeaders() }
        );

        await fetchClients();

        if (state.selectedClient?._id === clientId || state.selectedClient?.id === clientId) {
          dispatch({ type: ACTION_TYPES.SET_SELECTED_CLIENT, payload: null });
        }

        return response.data;
      } catch (error) {
        let errorMessage = "Failed to delete client";
        
      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        handleUnauthorized();
      } else if (error.response?.status === 403) {
        errorMessage = getApiErrorMessage(error, "You don't have permission to delete");
      } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        throw new Error(errorMessage);
      } finally {
        dispatch({ type: ACTION_TYPES.SET_ACTION_LOADING, payload: false });
      }
    },
    [getCurrentToken, getCurrentAuthHeaders, fetchClients, state.selectedClient, handleUnauthorized]
  );

  const renewClientMembership = useCallback(
    async (clientId, extendDays) => {
      const token = getCurrentToken();
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      dispatch({ type: ACTION_TYPES.SET_ACTION_LOADING, payload: true });

      try {
        const response = await axios.post(
          `${API_BASE_URL}/clients/${clientId}/renew`,
          { extendDays },
          { headers: getCurrentAuthHeaders() }
        );

        await fetchClients();

        if (state.selectedClient?._id === clientId || state.selectedClient?.id === clientId) {
          await getClientById(clientId);
        }

        return response.data;
      } catch (error) {
        let errorMessage = "Failed to renew membership";
        
        if (error.response?.status === 401) {
          errorMessage = "Session expired. Please login again.";
          handleUnauthorized();
        } else if (error.response?.status === 403) {
          errorMessage = "Access denied. You don't have permission to renew memberships.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        throw new Error(errorMessage);
      } finally {
        dispatch({ type: ACTION_TYPES.SET_ACTION_LOADING, payload: false });
      }
    },
    [getCurrentToken, getCurrentAuthHeaders, fetchClients, getClientById, state.selectedClient, handleUnauthorized]
  );

  const updateFilters = useCallback((filters) => {
    dispatch({ type: ACTION_TYPES.UPDATE_FILTERS, payload: filters });
  }, []);

  const changePage = useCallback((page) => {
    dispatch({ type: ACTION_TYPES.SET_PAGINATION, payload: { page } });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({
      type: ACTION_TYPES.UPDATE_FILTERS,
      payload: {
        search: "",
        status: "all",
        membershipPlan: "all",
        sortBy: "createdAt",
        sortOrder: "desc",
        limit: 12,
      },
    });
    dispatch({ type: ACTION_TYPES.SET_PAGINATION, payload: { page: 1 } });
  }, []);

  // Initial load
  useEffect(() => {
    if (authLoading || !authInitialized) {
      return;
    }

    if (!isAuthenticated) {
      initialLoadDone.current = false;
      dispatch({ type: ACTION_TYPES.SET_INITIAL_LOADING, payload: false });
      return;
    }

    if (user?.role !== "super_admin" && user?.role !== "admin") {
      initialLoadDone.current = false;
      dispatch({ type: ACTION_TYPES.SET_INITIAL_LOADING, payload: false });
      return;
    }

    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchClients({ page: 1 });
    }
  }, [authLoading, authInitialized, isAuthenticated, user?.role, fetchClients]);

  // Listen for filter changes and refetch
  useEffect(() => {
    if (initialLoadDone.current) {
      const timer = setTimeout(() => {
        fetchClients();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.filters, fetchClients]);

  const value = {
    ...state,
    getAllClients,
    fetchClients,
    getClientById,
    addClient,
    editClient,
    changeClientStatus,
    deleteClient,
    renewClientMembership,
    updateFilters,
    changePage,
    resetFilters,
    clearError,
    resetState,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClient must be used within a ClientProvider");
  }
  return context;
};

export default ClientContext;
