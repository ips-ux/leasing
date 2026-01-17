import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  Login,
  Dashboard,
  ApplicantsList,
  ApplicantDetail,
  InquiriesList,
  InquiryDetail,
  Reports,
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
            border: '3px solid #000',
            padding: '16px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
          },
          success: {
            style: {
              background: '#B4F8C8',
            },
          },
          error: {
            style: {
              background: '#FFB4B4',
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
          path="/inquiries/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <InquiryDetail />
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

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
