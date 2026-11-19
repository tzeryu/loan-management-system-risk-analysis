import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/app/context/AuthContext';
import { LoginPage } from '@/app/pages/LoginPage';
import { LoanOfficerDashboard } from '@/app/pages/LoanOfficerDashboard';
import { CreateLoanApplication } from '@/app/pages/CreateLoanApplication';
import { ViewRiskAnalysis } from '@/app/pages/ViewRiskAnalysis';
import { TrackApplications } from '@/app/pages/TrackApplications';
import { AdminDashboard } from '@/app/pages/AdminDashboard';
import { ReviewApplication } from '@/app/pages/ReviewApplication';
import { AuditLog } from '@/app/pages/AuditLog';
import { ManageUsers } from '@/app/pages/ManageUsers';
import { Toaster } from '@/app/components/ui/sonner';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: 'loan-officer' | 'administrator' }) {
  const { isAuthenticated, userRole } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (userRole !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            userRole === 'loan-officer' ? 
              <Navigate to="/loan-officer/dashboard" replace /> : 
              <Navigate to="/admin/dashboard" replace />
          ) : (
            <LoginPage />
          )
        } 
      />
      
      {/* Loan Officer Routes */}
      <Route
        path="/loan-officer/dashboard"
        element={
          <ProtectedRoute allowedRole="loan-officer">
            <LoanOfficerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-officer/create"
        element={
          <ProtectedRoute allowedRole="loan-officer">
            <CreateLoanApplication />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-officer/view-risk/:id"
        element={
          <ProtectedRoute allowedRole="loan-officer">
            <ViewRiskAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-officer/track"
        element={
          <ProtectedRoute allowedRole="loan-officer">
            <TrackApplications />
          </ProtectedRoute>
        }
      />

      {/* Administrator Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="administrator">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/review/:id"
        element={
          <ProtectedRoute allowedRole="administrator">
            <ReviewApplication />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-log"
        element={
          <ProtectedRoute allowedRole="administrator">
            <AuditLog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/manage-users"
        element={
          <ProtectedRoute allowedRole="administrator">
            <ManageUsers />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}