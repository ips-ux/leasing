import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  Login,
  Dashboard,
  ApplicantsList,
  ApplicantDetail,
  InquiriesList,
  Reports,
  Scheduler,
  DataMigration,
} from './pages';
import { Layout, ProtectedRoute } from './components/layout';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.8)',
            borderRadius: '16px',
            padding: '16px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            color: '#4A5568',
          },
          success: {
            style: {
              background: '#E8F5E9',
              borderLeft: '4px solid #4CAF50',
            },
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#E8F5E9',
            },
          },
          error: {
            style: {
              background: '#FFEBEE',
              borderLeft: '4px solid #EF5350',
            },
            iconTheme: {
              primary: '#EF5350',
              secondary: '#FFEBEE',
            },
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/applicants"
          element={
            <ProtectedRoute>
              <Layout>
                <ApplicantsList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/applicants/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ApplicantDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inquiries"
          element={
            <ProtectedRoute>
              <Layout>
                <InquiriesList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/scheduler"
          element={
            <ProtectedRoute>
              <Layout>
                <Scheduler />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/data-migration"
          element={
            <ProtectedRoute>
              <Layout>
                <DataMigration />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
