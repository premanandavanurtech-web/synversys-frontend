import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { api } from "./AssetContext";

const TicketContext = createContext(null);

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) throw new Error("useTickets must be used within TicketProvider");
  return context;
};

export const TicketProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (fn, setOperationLoading = setLoading) => {
    setOperationLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Ticket request failed";
      setError(message);
      throw err;
    } finally {
      setOperationLoading(false);
    }
  }, []);

  const fetchTickets = useCallback(
    (filters = {}) =>
      run(async () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "" && value !== "all") {
            params.append(key, value);
          }
        });
        const res = await api.get(`/tickets${params.toString() ? `?${params}` : ""}`);
        return res.data?.data || res.data;
      }, setFetchLoading),
    [run],
  );

  const createTicket = useCallback(
    (data, files = []) =>
      run(async () => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => formData.append(key, value));
        files.forEach((file) => formData.append("attachments", file));
        const res = await api.post("/tickets", formData);
        return res.data?.data || res.data;
      }, setActionLoading),
    [run],
  );

  const raiseToSuperAdmin = useCallback(
    (id, notes = "") =>
      run(async () => {
        const res = await api.patch(`/tickets/${id}/raise-to-super-admin`, { notes });
        return res.data?.data || res.data;
      }, setActionLoading),
    [run],
  );

  const updateTicketStatus = useCallback(
    (id, status, notes = "") =>
      run(async () => {
        const res = await api.patch(`/tickets/${id}/status`, { status, notes });
        return res.data?.data || res.data;
      }, setActionLoading),
    [run],
  );

  const value = useMemo(
    () => ({
      loading,
      fetchLoading,
      actionLoading,
      error,
      fetchTickets,
      createTicket,
      raiseToSuperAdmin,
      updateTicketStatus,
    }),
    [loading, fetchLoading, actionLoading, error, fetchTickets, createTicket, raiseToSuperAdmin, updateTicketStatus],
  );

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
};
