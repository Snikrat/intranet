import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/auth";

type PublicRouteProps = {
  children: React.ReactNode;
};

export function PublicRoute({ children }: PublicRouteProps) {
  if (isAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
