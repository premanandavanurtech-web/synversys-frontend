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
//  - ADDED: linkChildAsset method for linking assets directly
//  - FIXED: Team members can now link assets (canLinkAsset = true for both admin and team)
//  - FIXED: Team members can now create child requests (canCreateChild = true)

import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContexts";
import { api } from "./AssetContext";

const AssetRequestContext = createContext();

const normalizeRequestData = (value) => {
  if (!value || typeof value !== "object") return null;

  const candidate =
    value._id || value.id
      ? value
      : value?.data?.request ||
        value?.data?.assetRequest ||
        value?.data ||
        value?.request ||
        value?.assetRequest ||
        value?._doc;

  if (!candidate || typeof candidate !== "object") return null;

  const requestId = candidate._id || candidate.id;
  return requestId ? { ...candidate, _id: requestId } : null;
};

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
  const canCreateChild = true; // ✅ FIXED: Both admin AND team can create child requests
  const canLinkAsset = true; // ✅ FIXED: Both admin AND team can link assets
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
  const getRequestById = useCallback(
    (id) =>
      request(async () => {
        const res = await api.get(`/asset-requests/${id}`);
        
        const requestData = normalizeRequestData(res.data);
        
        if (!requestData) {
          console.error("Invalid request data received:", res.data);
          throw new Error("Request not found or invalid data structure");
        }
        
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
  const createParentRequest = useCallback(
    (data) =>
      request(async () => {
        const res = await api.post("/asset-requests/parent", data);
        return res.data;
      }),
    [request],
  );

  const createRequest = createParentRequest;

  // ── POST /asset-requests/:parentId/child (UPDATED - both admin and team) ─────
  const createChildRequest = useCallback(
    (parentId, data) =>
      request(async () => {
        // ✅ Removed admin-only restriction - both admin and team can create child requests
        const res = await api.post(`/asset-requests/${parentId}/child`, data);
        return res.data;
      }),
    [request],
  );

  // ── POST /asset-requests/:requestId/link-child ──────────────────────────────────
  const linkChildAsset = useCallback(
    (requestId, childAssetId, relationshipType = "accessory") =>
      request(async () => {
        const res = await api.post(`/asset-requests/${requestId}/link-child`, {
          childAssetId,
          relationshipType,
        });
        return res.data;
      }),
    [request],
  );

  // ── PATCH /asset-requests/:id/approve (admin only) ───────────────────────────
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

  // ── POST /asset-requests/:requestId/link-asset (UPDATED - both admin and team) ──
  const linkAsset = useCallback(
    (requestId, childAssetId, relationshipType = "accessory") =>
      request(async () => {
        const res = await api.post(`/asset-requests/${requestId}/link-asset`, {
          childAssetId,
          relationshipType,
        });
        return res.data;
      }),
    [request],
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
    isAdmin,
    isTeam,
    canApprove,
    canReject,
    canViewStats,
    canCreateParent,
    canCreateChild: true,
    canLinkAsset: true,
    canComplete,
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
    linkChildAsset,
    updateChildStatus,
  };

  return (
    <AssetRequestContext.Provider value={value}>
      {children}
    </AssetRequestContext.Provider>
  );
};
