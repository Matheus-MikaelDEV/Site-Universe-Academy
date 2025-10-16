import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";

export const PublicRouteGuard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="container flex flex-col items-center gap-4">
          <Skeleton className="h-8 w-1/4 mb-4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : <Outlet />;
};