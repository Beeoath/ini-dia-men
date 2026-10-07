import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import SigmaHub from "./pages/SigmaHub";
import Material from "./pages/Material";
import ModuleDetail from "./pages/ModuleDetail";
import Quiz from "./pages/Quiz";
import QuizResult from "./pages/QuizResult";
import Pretest from "./pages/Pretest";
import Posttest from "./pages/Posttest";
import Discussions from "./pages/Discussions";
import ThreadDetail from "./pages/ThreadDetail";
import Profile from "./pages/Profile";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherContent from "./pages/TeacherContent";
import TeacherModeration from "./pages/TeacherModeration";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ResetPassword from "./pages/ResetPassword";

function AppLayout({ requireRole }: { requireRole?: "student" | "teacher" }) {
  return (
    <ProtectedRoute requireRole={requireRole}>
      <AppShell />
    </ProtectedRoute>
  );
}

function DiscussionDetailRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/app/diskusi/${id}` : "/app/diskusi"} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/masuk" element={<Login />} />
            <Route path="/login" element={<Navigate to="/masuk" replace />} />
            <Route path="/daftar" element={<Navigate to="/masuk?mode=daftar" replace />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Student & General Protected Routes (Single Layout Route) */}
            <Route element={<AppLayout />}>
              <Route path="/app" element={<StudentDashboard />} />
              <Route path="/app/dashboard" element={<StudentDashboard />} />
              <Route path="/app/hub" element={<SigmaHub />} />
              
              {/* Forum Diskusi */}
              <Route path="/app/diskusi" element={<Discussions />} />
              <Route path="/app/diskusi/:id" element={<ThreadDetail />} />
              <Route path="/app/discussions" element={<Navigate to="/app/diskusi" replace />} />
              <Route path="/app/discussions/:id" element={<DiscussionDetailRedirect />} />

              <Route path="/app/profil" element={<Profile />} />
              <Route path="/app/profile" element={<Profile />} />

              {/* Module, Material & Quiz Views */}
              <Route path="/app/modul/:id" element={<ModuleDetail />} />
              <Route path="/app/module/:id" element={<ModuleDetail />} />
              <Route path="/app/materi/:id" element={<Material />} />
              <Route path="/app/material/:id" element={<Material />} />
              <Route path="/app/kuis/:id" element={<Quiz />} />
              <Route path="/app/quiz/:id" element={<Quiz />} />
              <Route path="/app/hasil-kuis/:id" element={<QuizResult />} />
              <Route path="/app/quiz-result/:id" element={<QuizResult />} />
              <Route path="/app/pretest/:id" element={<Pretest />} />
              <Route path="/app/posttest/:id" element={<Posttest />} />
            </Route>

            {/* Teacher Routes (Protected Teacher Layout) */}
            <Route element={<AppLayout requireRole="teacher" />}>
              <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/content" element={<TeacherContent />} />
              <Route path="/teacher/moderation" element={<TeacherModeration />} />
              <Route path="/teacher/*" element={<Navigate to="/teacher/dashboard" replace />} />
            </Route>

            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
