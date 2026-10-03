import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

            {/* Student Spatial Views (Protected) */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <StudentDashboard />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/dashboard"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <StudentDashboard />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/hub"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <SigmaHub />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/diskusi"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Discussions />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/discussions"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Discussions />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/diskusi/:id"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <ThreadDetail />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/discussions/:id"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <ThreadDetail />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/profil"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Profile />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/profile"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Profile />
                  </AppShell>
                </ProtectedRoute>
              }
            />

            {/* Module, Material & Quiz Views (Protected) */}
            <Route
              path="/app/modul/:id"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <ModuleDetail />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/module/:id"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <ModuleDetail />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/materi/:id"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Material />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/material/:id"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Material />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/kuis/:id"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Quiz />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/quiz/:id"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Quiz />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/hasil-kuis/:id"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <QuizResult />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/quiz-result/:id"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <QuizResult />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/pretest/:id"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Pretest />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/posttest/:id"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Posttest />
                  </AppShell>
                </ProtectedRoute>
              }
            />

            {/* Teacher Routes (Protected, require teacher role) */}
            <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute requireRole="teacher">
                  <AppShell>
                    <TeacherDashboard />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/content"
              element={
                <ProtectedRoute requireRole="teacher">
                  <AppShell>
                    <TeacherContent />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/moderation"
              element={
                <ProtectedRoute requireRole="teacher">
                  <AppShell>
                    <TeacherModeration />
                  </AppShell>
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
