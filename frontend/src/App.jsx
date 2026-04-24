import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// User Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import BusinessExplorer from './pages/BusinessExplorer';
import BusinessDetail from './pages/BusinessDetail';
import RoadmapView from './pages/RoadmapView';
import LearningResources from './pages/LearningResources';
import ResourceDetail from './pages/ResourceDetail';
import Bookmarks from './pages/Bookmarks';

// Mentor Pages
import MentorRegister from './pages/MentorRegister';
import MentorOnboarding from './pages/MentorOnboarding';
import MentorPendingVerification from './pages/MentorPendingVerification';

// ─── Protected Route (User) ────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user, isMentor } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // ── Mentor routing logic ──
  if (isMentor) {
    // If mentor onboarding not done → go to mentor onboarding
    if (!user?.mentorOnboardingCompleted &&
      location.pathname !== '/mentor/onboarding') {
      return <Navigate to="/mentor/onboarding" />;
    }
    // If mentor onboarding done but not approved → pending page
    if (user?.mentorOnboardingCompleted &&
      user?.mentorVerificationStatus !== 'approved' &&
      location.pathname !== '/mentor/pending') {
      return <Navigate to="/mentor/pending" />;
    }
    // If mentor approved but trying to access user pages
    // → redirect to mentor dashboard (we'll build this next)
    if (user?.mentorVerificationStatus === 'approved' &&
      location.pathname === '/dashboard') {
      return <Navigate to="/mentor/dashboard" />;
    }
  }

  // ── User routing logic ──
  if (!isMentor) {
    if (!user?.onboardingCompleted &&
      location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" />;
    }
    if (user?.onboardingCompleted &&
      location.pathname === '/onboarding') {
      return <Navigate to="/dashboard" />;
    }
  }

  return children;
};

// ─── Mentor Protected Route ────────────────────────────────
const MentorRoute = ({ children }) => {
  const { isAuthenticated, loading, user, isMentor } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isMentor) return <Navigate to="/dashboard" />;

  // Force onboarding if not done
  if (!user?.mentorOnboardingCompleted &&
    location.pathname !== '/mentor/onboarding') {
    return <Navigate to="/mentor/onboarding" />;
  }

  // Force pending page if not approved
  if (user?.mentorOnboardingCompleted &&
    user?.mentorVerificationStatus !== 'approved' &&
    location.pathname !== '/mentor/pending') {
    return <Navigate to="/mentor/pending" />;
  }

  return children;
};

// ─── Public Only Route (redirect if logged in) ─────────────
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user, isMentor } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    if (isMentor) {
      if (!user?.mentorOnboardingCompleted) {
        return <Navigate to="/mentor/onboarding" />;
      }
      if (user?.mentorVerificationStatus !== 'approved') {
        return <Navigate to="/mentor/pending" />;
      }
      return <Navigate to="/mentor/dashboard" />;
    }
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <BrowserRouter>
        <Routes>

          {/* ── Public Routes ── */}
          <Route path="/" element={<Landing />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/mentor/register"
            element={
              <PublicRoute>
                <MentorRegister />
              </PublicRoute>
            }
          />

          {/* ── Mentor Routes ── */}
          <Route
            path="/mentor/onboarding"
            element={
              <MentorRoute>
                <MentorOnboarding />
              </MentorRoute>
            }
          />
          <Route
            path="/mentor/pending"
            element={
              <MentorRoute>
                <MentorPendingVerification />
              </MentorRoute>
            }
          />

          {/* ── User Protected Routes ── */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/businesses"
            element={
              <ProtectedRoute>
                <BusinessExplorer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business/:slug"
            element={
              <ProtectedRoute>
                <BusinessDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roadmap/:slug"
            element={
              <ProtectedRoute>
                <RoadmapView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <LearningResources />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources/:slug"
            element={
              <ProtectedRoute>
                <ResourceDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <ProtectedRoute>
                <Bookmarks />
              </ProtectedRoute>
            }
          />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;