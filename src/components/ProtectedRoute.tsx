import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: "student" | "teacher";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireRole,
}) => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#070913] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="font-mono text-xs text-slate-400">Memuat sesi SIGMA...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    const isHub = location.pathname.includes("/hub");
    return (
      <Navigate
        to={`/masuk?redirect=${redirectPath}${isHub ? "&notice=peta_belajar" : ""}`}
        replace
      />
    );
  }

  if (requireRole && profile.role !== requireRole) {
    if (requireRole === "teacher") {
      return <Navigate to="/masuk?role=guru" replace />;
    }
  }

  return <>{children}</>;
};
