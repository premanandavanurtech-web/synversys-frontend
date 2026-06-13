// context/AssetRequestContext.jsx
// Fixes:
//  - Uses shared `api` instance from AssetContext (interceptor handles auth headers)
//  - Correct endpoint paths aligned with Postman collection (POST /parent, GET /asset/:id, etc.)
//  - Role-aware helpers exposed: canApprove, canReject, canViewStats, canCreateChild
//  - Approve payload key fixed: "approvalNotes" → body key matches backend expectation
//  - Reject payload key: "reason" (confirmed from Postman)
//  - Complete endpoint added
//  - updateChildStatus added
//  - getRequestTree added
//  - getStats added (admin-only)
//  - All setLoading/setError properly reset in finally blocks
//  - FIXED: Proper response extraction and error handling for getRequestById

import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContexts";
import { api } from "./AssetContext"; // ← single shared axios instance with auth interceptor

const AssetRequestContext = createContext();

export const useAssetRequest = () => {
  const ctx = useContext(AssetRequestContext);
  if (!ctx)
    throw new Error(
      "useAssetRequest must be used within an AssetRequestProvider",
    );
  return ctx;
};

export const AssetRequestProvider = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Role helpers ─────────────────────────────────────────────────────────────
  const role = user?.role;
  const isAdmin = role === "admin" || role === "super_admin";
  const isTeam = role === "team";

  const canApprove = isAdmin;
  const canReject = isAdmin;
  const canViewStats = isAdmin;
  const canCreateParent = true; // both admin & team
  const canCreateChild = isAdmin; // only admin per Postman collection
  const canLinkAsset = isAdmin;
  const canComplete = true; // both can complete (team = own, admin = any)

  // ── Generic request helper ────────────────────────────────────────────────────
  const request = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "An error occurred";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── GET /asset-requests ───────────────────────────────────────────────────────
  // Admin: all requests scoped to their admin account
  // Team:  only their own requests
  const fetchRequests = useCallback(
    (filters = {}) =>
      request(async () => {
        const {
          page = 1,
          limit = 10,
          type = "all",
          status,
          search,
          urgency,
          requestType,
          sortBy,
          sortOrder,
        } = filters;

        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", limit);
        if (type && type !== "all") params.append("type", type);
        if (status && status !== "all") params.append("status", status);
        if (search) params.append("search", encodeURIComponent(search));
        if (urgency) params.append("urgency", urgency);
        if (requestType) params.append("requestType", requestType);
        if (sortBy) params.append("sortBy", sortBy);
        if (sortOrder) params.append("sortOrder", sortOrder);

        const res = await api.get(`/asset-requests?${params}`);
        return res.data;
      }),
    [request],
  );

  // ── GET /asset-requests/:id ───────────────────────────────────────────────────
  // FIXED: Properly handles different response structures and validates data
  const getRequestById = useCallback(
    (id) =>
      request(async () => {
        const res = await api.get(`/asset-requests/${id}`);
        
        console.log("Raw API response:", res.data);
        
        // Handle different response structures
        let requestData = null;
        
        // Case 1: Direct request object with _id
        if (res.data && res.data._id) {
          requestData = res.data;
        }
        // Case 2: Nested in data.request
        else if (res.data?.data?.request && res.data.data.request._id) {
          requestData = res.data.data.request;
        }
        // Case 3: Nested in request property
        else if (res.data?.request && res.data.request._id) {
          requestData = res.data.request;
        }
        // Case 4: Success wrapper with data
        else if (res.data?.success && res.data?.data) {
          requestData = res.data.data.request || res.data.data;
        }
        // Case 5: Check if response has the minimal required fields
        else if (res.data && (res.data.status || res.data.requestType)) {
          requestData = res.data;
        }
        
        // Validate that we got a valid request object
        if (!requestData || !requestData._id) {
          console.error("Invalid request data received:", res.data);
          throw new Error("Request not found or invalid data structure");
        }
        
        console.log("Extracted request data:", requestData);
        return requestData;
      }),
    [request],
  );

  // ── GET /asset-requests/asset/:assetId ───────────────────────────────────────
  const getRequestsByAsset = useCallback(
    (assetId) =>
      request(async () => {
        const res = await api.get(`/asset-requests/asset/${assetId}`);
        return res.data;
      }),
    [request],
  );

  // ── GET /asset-requests/:parentId/tree ───────────────────────────────────────
  const getRequestTree = useCallback(
    (parentId) =>
      request(async () => {
        const res = await api.get(`/asset-requests/${parentId}/tree`);
        return res.data;
      }),
    [request],
  );

  // ── GET /asset-requests/stats/summary (admin only) ───────────────────────────
  const getStats = useCallback(
    () =>
      request(async () => {
        if (!canViewStats) throw new Error("Access denied: admin only");
        const res = await api.get("/asset-requests/stats/summary");
        return res.data;
      }),
    [request, canViewStats],
  );

  // ── POST /asset-requests/parent ──────────────────────────────────────────────
  // Both admin and team can create parent requests
  const createParentRequest = useCallback(
    (data) =>
      request(async () => {
        const res = await api.post("/asset-requests/parent", data);
        return res.data;
      }),
    [request],
  );

  // Alias kept for backwards compat
  const createRequest = createParentRequest;

  // ── POST /asset-requests/:parentId/child (admin only) ────────────────────────
  const createChildRequest = useCallback(
    (parentId, data) =>
      request(async () => {
        if (!canCreateChild) throw new Error("Access denied: admin only");
        const res = await api.post(`/asset-requests/${parentId}/child`, data);
        return res.data;
      }),
    [request, canCreateChild],
  );

  // ── PATCH /asset-requests/:id/approve (admin only) ───────────────────────────
  // Backend expects { approvalNotes: "..." }  (key from Postman collection)
  const approveRequest = useCallback(
    (id, approvalNotes = "") =>
      request(async () => {
        if (!canApprove) throw new Error("Access denied: admin only");
        const res = await api.patch(`/asset-requests/${id}/approve`, {
          approvalNotes,
        });
        return res.data;
      }),
    [request, canApprove],
  );

  // ── PATCH /asset-requests/:id/reject (admin only) ────────────────────────────
  // Backend expects { reason: "..." }
  const rejectRequest = useCallback(
    (id, reason) =>
      request(async () => {
        if (!canReject) throw new Error("Access denied: admin only");
        const res = await api.patch(`/asset-requests/${id}/reject`, { reason });
        return res.data;
      }),
    [request, canReject],
  );

  // ── PATCH /asset-requests/:id/complete ───────────────────────────────────────
  // Admin can complete any approved request; team can only complete their own approved request
  const completeRequest = useCallback(
    (id, completionNotes = "") =>
      request(async () => {
        const res = await api.patch(`/asset-requests/${id}/complete`, {
          completionNotes,
        });
        return res.data;
      }),
    [request],
  );

  // ── POST /asset-requests/:requestId/link-asset (admin only) ──────────────────
  const linkAsset = useCallback(
    (requestId, childAssetId, relationshipType = "accessory") =>
      request(async () => {
        if (!canLinkAsset) throw new Error("Access denied: admin only");
        const res = await api.post(`/asset-requests/${requestId}/link-asset`, {
          childAssetId,
          relationshipType,
        });
        return res.data;
      }),
    [request, canLinkAsset],
  );

  // ── PATCH /asset-requests/:parentId/child/:childId/status (admin only) ───────
  const updateChildStatus = useCallback(
    (parentId, childId, status, updates = {}) =>
      request(async () => {
        if (!isAdmin) throw new Error("Access denied: admin only");
        const res = await api.patch(
          `/asset-requests/${parentId}/child/${childId}/status`,
          { status, updates },
        );
        return res.data;
      }),
    [request, isAdmin],
  );

  const value = {
    loading,
    error,
    // Role flags
    isAdmin,
    isTeam,
    canApprove,
    canReject,
    canViewStats,
    canCreateParent,
    canCreateChild,
    canLinkAsset,
    canComplete,
    // API methods
    fetchRequests,
    getRequestById,
    getRequestsByAsset,
    getRequestTree,
    getStats,
    createRequest,
    createParentRequest,
    createChildRequest,
    approveRequest,
    rejectRequest,
    completeRequest,
    linkAsset,
    updateChildStatus,
  };

  return (
    <AssetRequestContext.Provider value={value}>
      {children}
    </AssetRequestContext.Provider>
  );
};