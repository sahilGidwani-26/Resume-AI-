import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/Themecontext';

import LandingPage from './pages/Landingpage';
import LoginPage from './pages/Loginpage';
import SignupPage from './pages/Signuppage';
import DashboardPage from './pages/Dashboardpage';
import ResumeUploadPage from './pages/Resumeuploadpage';
import ResumeAnalysisPage from './pages/Resumeanalysispage';
import ResumeBuilderPage from './pages/Resumebuilderpage';
import JobRecommendationsPage from './pages/Jobrecommendationspage';
import RoadmapPage from './pages/Roadmappage';
import InterviewPage from './pages/Interviewpage';
import MockInterviewPage from './pages/Mockinterviewpage';
import NotesPage from './pages/Notespage';   // ← new
import PortfolioPage from './pages/Portfoliopage';
import PortfolioAnalysisPage from './pages/Portfolioanalysispage';
import PublicPortfolioPage from './pages/Publicportfoliopage';

import Sidebar from './components/Sidebar';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#080d1a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading…</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#080d1a] text-slate-100">
      {/* Sidebar — only for logged in users */}
      {user && <Sidebar />}

      {/* Main content area — push right by sidebar width */}
      <main
        className={`flex-1 min-w-0 transition-all duration-300 ${user ? 'md:ml-[240px]' : ''}`}
      >
        <Routes>
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><ResumeUploadPage /></ProtectedRoute>} />
          <Route path="/analysis/:id" element={<ProtectedRoute><ResumeAnalysisPage /></ProtectedRoute>} />
          <Route path="/builder" element={<ProtectedRoute><ResumeBuilderPage /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><JobRecommendationsPage /></ProtectedRoute>} />
          <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
          <Route path="/mock-interview" element={<ProtectedRoute><MockInterviewPage /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
          <Route path="/portfolio" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
          <Route path="/portfolio/:id/analysis" element={<ProtectedRoute><PortfolioAnalysisPage /></ProtectedRoute>} />
          <Route path="/portfolio/:slug" element={<PublicPortfolioPage />} />  {/* No auth — public */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#38bdf8', secondary: '#0f172a' } },
              error: { iconTheme: { primary: '#f87171', secondary: '#0f172a' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;