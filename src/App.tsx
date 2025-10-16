import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import { Skeleton } from "./components/ui/skeleton";
import ErrorBoundary from "./components/ErrorBoundary"; // Import ErrorBoundary

// Lazy load page components
const Index = lazy(() => import("./pages/Index"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CourseDetailPage = lazy(() => import("./pages/CourseDetailPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const IdealizersPage = lazy(() => import("./pages/IdealizersPage"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage")); // New
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage")); // New
const CertificateViewerPage = lazy(() => import("./pages/CertificateViewerPage")); // New
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminCoursesPage = lazy(() => import("./pages/admin/AdminCoursesPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminFeedbackPage = lazy(() => import("./pages/admin/AdminFeedbackPage"));
const AdminManageCourseContentPage = lazy(() => import("./pages/admin/AdminManageCourseContentPage"));
const AdminSendNotificationPage = lazy(() => import("./pages/admin/AdminSendNotificationPage")); // New
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class">
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <ErrorBoundary> {/* Wrap the entire app with ErrorBoundary */}
              <Suspense fallback={
                <div className="flex flex-col min-h-screen">
                  <div className="flex-grow container py-12 space-y-8">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
                  <Route path="/cursos" element={<CoursesPage />} />
                  <Route path="/cursos/:id" element={<CourseDetailPage />} />
                  <Route path="/sobre" element={<AboutPage />} />
                  <Route path="/idealizadores" element={<IdealizersPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} /> {/* New Public Route */}
                  <Route path="/certificado/:certificateId" element={<CertificateViewerPage />} /> {/* New Public Route */}
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/perfil" element={<ProfilePage />} />
                    <Route path="/notificacoes" element={<NotificationsPage />} /> {/* New Protected Route */}
                  </Route>

                  {/* Admin Routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route path="dashboard" element={<AdminDashboardPage />} />
                      <Route path="courses" element={<AdminCoursesPage />} />
                      <Route path="courses/:courseId/manage" element={<AdminManageCourseContentPage />} />
                      <Route path="users" element={<AdminUsersPage />} />
                      <Route path="feedback" element={<AdminFeedbackPage />} />
                      <Route path="send-notification" element={<AdminSendNotificationPage />} /> {/* New Admin Route */}
                    </Route>
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;