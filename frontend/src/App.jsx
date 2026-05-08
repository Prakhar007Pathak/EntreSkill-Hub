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
import MentorDirectory from './pages/MentorDirectory';
import MentorPublicProfile from './pages/MentorPublicProfile';
import MySessions from './pages/MySessions';
import SessionRoom from './pages/SessionRoom';
import QASessionInteraction from './pages/QASessionInteraction';

// Mentor Pages
import MentorRegister from './pages/MentorRegister';
import MentorOnboarding from './pages/MentorOnboarding';
import MentorPendingVerification from './pages/MentorPendingVerification';
import MentorDashboard from './pages/MentorDashboard';
import MentorUploadResource from './pages/MentorUploadResource';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import ManageUsers from './pages/admin/ManageUsers';
import ManageMentors from './pages/admin/ManageMentors';
import ApproveResources from './pages/admin/ApproveResources';
import ManageBusinesses from './pages/admin/ManageBusinesses';

// ─── Loading Spinner ───────────────────────────────────────
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

// ─── Protected Route (User) ────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user, isMentor, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Admin → always redirect to admin dashboard
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;

  // Mentor routing
  if (isMentor) {
    if (!user?.mentorOnboardingCompleted && location.pathname !== '/mentor/onboarding') {
      return <Navigate to="/mentor/onboarding" replace />;
    }
    if (
      user?.mentorOnboardingCompleted &&
      user?.mentorVerificationStatus !== 'approved' &&
      location.pathname !== '/mentor/pending'
    ) {
      return <Navigate to="/mentor/pending" replace />;
    }
    if (
      user?.mentorVerificationStatus === 'approved' &&
      location.pathname === '/dashboard'
    ) {
      return <Navigate to="/mentor/dashboard" replace />;
    }
  }

  // User routing
  if (!isMentor && !isAdmin) {
    if (!user?.onboardingCompleted && location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
    if (user?.onboardingCompleted && location.pathname === '/onboarding') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// ─── Mentor Route ──────────────────────────────────────────
const MentorRoute = ({ children, requireApproved = false }) => {
  const { isAuthenticated, loading, user, isMentor } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isMentor) return <Navigate to="/dashboard" replace />;

  if (
    !user?.mentorOnboardingCompleted &&
    location.pathname !== '/mentor/onboarding'
  ) {
    return <Navigate to="/mentor/onboarding" replace />;
  }

  if (
    user?.mentorOnboardingCompleted &&
    user?.mentorVerificationStatus !== 'approved' &&
    location.pathname !== '/mentor/pending'
  ) {
    return <Navigate to="/mentor/pending" replace />;
  }

  if (requireApproved && user?.mentorVerificationStatus !== 'approved') {
    return <Navigate to="/mentor/pending" replace />;
  }

  return children;
};

// ─── Admin Route ───────────────────────────────────────────
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
};

// ─── Public Only Route ─────────────────────────────────────
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user, isMentor, isAdmin } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
    if (isMentor) {
      if (!user?.mentorOnboardingCompleted)
        return <Navigate to="/mentor/onboarding" replace />;
      if (user?.mentorVerificationStatus !== 'approved')
        return <Navigate to="/mentor/pending" replace />;
      return <Navigate to="/mentor/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
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
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/mentor/register" element={<PublicRoute><MentorRegister /></PublicRoute>} />

          {/* ── Admin Routes ── */}
          <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
          <Route path="/admin/mentors" element={<AdminRoute><ManageMentors /></AdminRoute>} />
          <Route path="/admin/resources" element={<AdminRoute><ApproveResources /></AdminRoute>} />
          <Route path="/admin/businesses" element={<AdminRoute><ManageBusinesses /></AdminRoute>} />

          {/* ── Mentor Routes ── */}
          <Route path="/mentor/onboarding" element={<MentorRoute><MentorOnboarding /></MentorRoute>} />
          <Route path="/mentor/pending" element={<MentorRoute><MentorPendingVerification /></MentorRoute>} />
          <Route path="/mentor/dashboard" element={<MentorRoute requireApproved={true}><MentorDashboard /></MentorRoute>} />
          <Route path="/mentor/upload-resource" element={<MentorRoute requireApproved={true}><MentorUploadResource /></MentorRoute>} />

          {/* ── User Protected Routes ── */}
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/businesses" element={<ProtectedRoute><BusinessExplorer /></ProtectedRoute>} />
          <Route path="/business/:slug" element={<ProtectedRoute><BusinessDetail /></ProtectedRoute>} />
          <Route path="/roadmap/:slug" element={<ProtectedRoute><RoadmapView /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><LearningResources /></ProtectedRoute>} />
          <Route path="/resources/:slug" element={<ProtectedRoute><ResourceDetail /></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
          <Route path="/mentors" element={<ProtectedRoute><MentorDirectory /></ProtectedRoute>} />
          <Route path="/mentors/:mentorSlug" element={<ProtectedRoute><MentorPublicProfile /></ProtectedRoute>} />
          <Route path="/my-sessions" element={<ProtectedRoute><MySessions /></ProtectedRoute>} />
          <Route path="/session-room/:sessionId" element={<ProtectedRoute><SessionRoom /></ProtectedRoute>} />
          <Route path="/qa-room/:sessionId" element={<ProtectedRoute><QASessionInteraction /></ProtectedRoute>} />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;