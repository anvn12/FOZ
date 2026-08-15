import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/auth";

type RequireRoleProps = {
  roles: string[];
  children: React.ReactNode;
};

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { user, status } = useAuthStore();
  const location = useLocation();

  if (status === "refreshing") {
    return <div className="p-8 text-center text-on-surface-variant">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/latest" replace />;
  }

  return <>{children}</>;
}
