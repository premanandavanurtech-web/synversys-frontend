// context/AnalyticsContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContexts';

const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [filters, setFilters] = useState({
    period: 'monthly',
    startDate: null,
    endDate: null,
    category: null,
    status: null,
    assetId: null,
    checklistId: null,
    teamMemberId: null,
  });

  const fetchAnalytics = useCallback(async (refresh = false) => {
    if (!user) return;

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://synversysbackend-production.up.railway.app/api/v1/dashboard/Analytics',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            period: filters.period,
            startDate: filters.startDate,
            endDate: filters.endDate,
            category: filters.category,
            status: filters.status,
            assetId: filters.assetId,
            checklistId: filters.checklistId,
            teamMemberId: filters.teamMemberId,
          },
        }
      );

      if (response.data?.success) {
        setData(response.data.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch analytics data';
      setError(message);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user, filters]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const refresh = useCallback(() => {
    fetchAnalytics(true);
  }, [fetchAnalytics]);

  const exportData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://synversysbackend-production.up.railway.app/api/v1/dashboard/Analytics/export',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            period: filters.period,
            startDate: filters.startDate,
            endDate: filters.endDate,
            category: filters.category,
            status: filters.status,
            assetId: filters.assetId,
            checklistId: filters.checklistId,
            teamMemberId: filters.teamMemberId,
          },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      const message = err.response?.data?.message || 'Failed to export data';
      setError(message);
    }
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters({
      period: 'monthly',
      startDate: null,
      endDate: null,
      category: null,
      status: null,
      assetId: null,
      checklistId: null,
      teamMemberId: null,
    });
  }, []);

  // Auto-fetch on mount and filter changes
  useEffect(() => {
    if (user) {
      fetchAnalytics(false);
    }
  }, [user, filters.period]); // Only re-fetch when period changes or user loads

  const value = {
    data,
    loading,
    error,
    isRefreshing,
    filters,
    selectedTab,
    setSelectedTab,
    updateFilters,
    refresh,
    exportData,
    clearFilters,
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};