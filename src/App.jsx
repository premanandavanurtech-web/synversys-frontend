// App.jsx - Updated with all fixes and proper routing
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContexts";
import { PreferencesProvider } from "./context/PreferencesContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AuditProvider } from "./context/AuditContext";
import { AssetProvider } from "./context/AssetContext";
import { AssetCategoryProvider } from "./context/AssetCategoryContexts";
import { ClientProvider } from "./context/ClientContext";
import { TeamProvider } from "./context/TeamContext";
import { DashboardProvider } from "./context/DashboardContext";
import { ReportProvider } from "./context/ReportContext";
import { ChecklistBuilderProvider } from "./context/ChecklistBuilderContext";
import { RequestChecklistProvider } from "./context/RequestChecklistContext";
import { AssignmentProvider } from "./context/AssignmentContext";
import { AssetRequestProvider } from "./context/AssetRequestContext";
import TeamAssignmentProvider from "./context/TeamAssignmentcontext";
import { ContactInquiryProvider } from "./context/InquiryContext";
import { RecycleBinProvider } from "./context/Recyclebincontext";
import { RoleProvider } from "./context/RoleContext";
import { DepartmentProvider } from "./context/DepartmentContext";
import { TicketProvider } from "./context/TicketContext";

// ── Pages ─────────────────────────────────────────────────────────────────────
import Login from "./components/Login";
import TeamProfile from "./pages/TeamProfile";
import Dashboard from "./pages/Dashboard";
import ClientManagement from "./pages/ClientManagement";
import ClientDetails from "./pages/ClientDetails";
import DashboardLayout from "./layout/Layout";
import TeamManagement from "./pages/TeamManagement";
import TeamDetails from "./pages/TeamDetails";
import ReportsPage from "./pages/Reports";
import ChecklistPage from "./pages/ChecklistBuilder";
import CustomChecklist from "./pages/CustomChecklist";
import GlobalChecklist from "./pages/GlobalChecklist";
import ImportChecklist from "./pages/ImportChecklist";
import CloneChecklist from "./pages/CloneChecklist";
import AssignedChecklist from "./pages/AssignedChecklist";
import Checklistanalytics from "./pages/Checklistanalytics";
import AssignedChecklistDetails from "./pages/AssignedCheckListDetails";
import SubmissionDetails from "./pages/Submissiondetails";
import AssetManagement from "./pages/AssetManagement";
import AddNewAsset from "./pages/AddNewAsset";
import AssetView from "./pages/AssetView";
import EditAsset from "./pages/EditAsset";
import CloneAssets from "./pages/CloneAssetList";
import MyTasks from "./pages/MyTask";
import TaskDetails from "./pages/TaskDetails";
import InspectionHistory from "./pages/Inspectionhistory";
import InspectionHistoryDetails from "./pages/InspectionHistoryDetails";
import MyRequests from "./pages/Myrequests";
import AssetRequestsApp from "./pages/AssetRequest";
import CreateAssetRequest from "./pages/CreateAssetRequest";
import AssetRequestDetails from "./pages/AssetRequestDetails";
import ContactInquiries from "./pages/ContactInquiries";
import AuditLogs from "./pages/AuditLogs";
import Main from "./pages/landing/Main";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import InactivityTimeout from "./components/InactivityTimeout";
import AssetCategoryPage from "./pages/AssetCategory";
import RolesManagement from "./pages/RolesManagement";
import DepartmentsManagement from "./pages/DepartmentsManagement";
import LocationsManagement from "./pages/LocationsManagement";
import RecycleBin from "./pages/Recyclebin";
import AssignmentDetailPage from "./pages/Assignmentdetailpage";
import AssignmentAnalyticsPage from "./pages/Assignmentanalyticspage";
import Settings from "./pages/Settings";
import Tickets from "./pages/Tickets";
import UnderConstruction from "./pages/UnderConstruction";

// ══════════════════════════════════════════════════════════════════════════════
// Providers
// ══════════════════════════════════════════════════════════════════════════════
const AppProviders = ({ children }) => (
  <AuthProvider>
    <PreferencesProvider>
      <NotificationProvider>
        <AuditProvider>
          <ClientProvider>
            <TeamProvider>
              <AssetProvider>
                <AssetCategoryProvider>
                  <ReportProvider>
                    <AssignmentProvider>
                      <DashboardProvider>
                        <ChecklistBuilderProvider>
                          <RequestChecklistProvider>
                            <AssetRequestProvider>
                              <TeamAssignmentProvider>
                                <ContactInquiryProvider>
                                  <RecycleBinProvider>
                                    <RoleProvider>
                                      <DepartmentProvider>
                                        <TicketProvider>
                                          {children}
                                        </TicketProvider>
                                      </DepartmentProvider>
                                    </RoleProvider>
                                  </RecycleBinProvider>
                                </ContactInquiryProvider>
                              </TeamAssignmentProvider>
                            </AssetRequestProvider>
                          </RequestChecklistProvider>
                        </ChecklistBuilderProvider>
                      </DashboardProvider>
                    </AssignmentProvider>
                  </ReportProvider>
                </AssetCategoryProvider>
              </AssetProvider>
            </TeamProvider>
          </ClientProvider>
        </AuditProvider>
      </NotificationProvider>
    </PreferencesProvider>
  </AuthProvider>
);

// ══════════════════════════════════════════════════════════════════════════════
// Role helper — super_admin uses the admin layout/routes
// ══════════════════════════════════════════════════════════════════════════════
const effectiveRole = (role) => (role === "super_admin" ? "admin" : role);

// ══════════════════════════════════════════════════════════════════════════════
// Protected Route
// ══════════════════════════════════════════════════════════════════════════════
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8fafc",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #e2e8f0",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: 16,
            }}
          />
          <p style={{ color: "#64748b" }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const role = effectiveRole(user.role);
  if (!allowedRoles.includes(role)) {
    if (role === "admin") return <Navigate to="/dashboard" replace />;
    if (role === "team") return <Navigate to="/team" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ══════════════════════════════════════════════════════════════════════════════
// App
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  return (
    <AppProviders>
      <Router>
        <InactivityTimeout />
        <Routes>
          {/* ── Public ──────────────────────────────────────────────────────── */}
          <Route path="/" element={<UnderConstruction />} />
          <Route path="/landing" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/under-construction" element={<UnderConstruction />} />

          {/* ── Admin Dashboard ─────────────────────────────────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Team routes ─────────────────────────────────────────────────── */}
          <Route
            path="/team"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <MyTasks />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/task/:id"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <TaskDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/inspection/:id"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <InspectionHistoryDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/history"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <InspectionHistory />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/profile"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <TeamProfile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/reports"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <ReportsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/my-requests"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <MyRequests />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/tickets"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <Tickets />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/under-construction"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <UnderConstruction inDashboard={true} />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Reports ─────────────────────────────────────────────────────── */}
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <ReportsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Contact Inquiries ────────────────────────────────────────────── */}
          <Route
            path="/admin/contact-inquiries"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <ContactInquiries />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Audit Logs ──────────────────────────────────────────────────── */}
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={["admin", "team", "super_admin"]}>
                <DashboardLayout>
                  <AuditLogs />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Checklists ──────────────────────────────────────────────────── */}
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <Tickets />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets-raised"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <Tickets />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/checklists"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <ChecklistPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/checklists/clone"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <CloneChecklist />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/checklists/recycle-bin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <RecycleBin />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-checklist/global"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <GlobalChecklist />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-checklist/custom"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <CustomChecklist />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/import-checklist/excel"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <ImportChecklist />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Assigned Checklists ─────────────────────────────────────────── */}
          <Route
            path="/admin/assigned-checklists"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <AssignedChecklist />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ FIXED: Assignment Detail Page - supports both URL patterns */}
          <Route
            path="/admin/assigned-checklists/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <AssignmentDetailPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ FIXED: Assignment Analytics - supports both URL patterns */}
          <Route
            path="/admin/assigned-checklists/:id/analytics"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <AssignmentAnalyticsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ FIXED: Alternative analytics route for backward compatibility */}
          <Route
            path="/assignments/:id/analytics"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <AssignmentAnalyticsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ FIXED: Assignment detail alternative route */}
          <Route
            path="/assignments/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <AssignmentDetailPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Submission detail — accessed from SubmissionsTab inside detail page */}
          <Route
            path="/admin/assigned-checklists/submissions/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <SubmissionDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ FIXED: Alternative submission route */}
          <Route
            path="/assignments/submissions/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <SubmissionDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Legacy routes kept for backwards compatibility */}
          <Route
            path="/admin/checklist-analytics/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <Checklistanalytics />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assignment-details/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <AssignedChecklistDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assignment-submit-details/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <SubmissionDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Client Management ────────────────────────────────────────────── */}
          <Route
            path="/admin/clients"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <ClientManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clients-details/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <ClientDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Team Management ──────────────────────────────────────────────── */}
          <Route
            path="/admin/team"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <TeamManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/team-details/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <TeamDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Roles / Departments / Locations ──────────────────────────────── */}
          <Route
            path="/admin/roles"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <RolesManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <DepartmentsManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/locations"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <LocationsManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Asset Categories ─────────────────────────────────────────────── */}
          <Route
            path="/admin/asset-categories"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <AssetCategoryPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Assets ──────────────────────────────────────────────────────── */}
          <Route
            path="/admin/assets"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <AssetManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assets/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <AddNewAsset />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assets/view/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <AssetView />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assets/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <EditAsset />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assets/clone"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <CloneAssets />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Asset Requests ───────────────────────────────────────────────── */}
          <Route
            path="/admin/asset-requests"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <AssetRequestsApp />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/asset-requests/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <AssetRequestDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-request"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <CreateAssetRequest />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ── 404 ─────────────────────────────────────────────────────────── */}
          <Route
            path="/admin/asset-requests/create"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <CreateAssetRequest />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/asset-requests/create"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <CreateAssetRequest />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/under-construction"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <UnderConstruction inDashboard={true} />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AppProviders>
  );
}
