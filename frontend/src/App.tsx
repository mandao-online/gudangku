import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BottomNav } from "@/components/BottomNav";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import UnitsManagement from "./pages/UnitsManagement";
import CategoriesManagement from "./pages/CategoriesManagement";
import AttendanceManagement from "./pages/AttendanceManagement";
import UsersManagement from "./pages/UsersManagement";
import TestUsersPage from "./pages/TestUsersPage";
// import TrashedItems from "./pages/TrashedItems"; // Hidden from users
import Attendance from "./pages/Attendance";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <div className="max-w-md w-full mx-auto min-h-screen bg-background relative overflow-x-hidden">
                  <Index />
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <div className="max-w-md w-full mx-auto min-h-screen bg-background relative overflow-x-hidden">
                  <Inventory />
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />
            {/* Trash route hidden from users - available for admin access if needed
            <Route path="/inventory/trash" element={
              <ProtectedRoute>
                <div className="max-w-md w-full mx-auto min-h-screen bg-background relative overflow-x-hidden">
                  <TrashedItems />
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />
            */}
            <Route path="/attendance" element={
              <ProtectedRoute>
                <div className="max-w-md w-full mx-auto min-h-screen bg-background relative overflow-x-hidden">
                  <Attendance />
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <div className="max-w-md w-full mx-auto min-h-screen bg-background relative overflow-x-hidden">
                  <Profile />
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/units-management" element={
              <ProtectedRoute>
                <div className="max-w-md w-full mx-auto min-h-screen bg-background relative overflow-x-hidden">
                  <UnitsManagement />
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/categories-management" element={
              <ProtectedRoute>
                <div className="max-w-md w-full mx-auto min-h-screen bg-background relative overflow-x-hidden">
                  <CategoriesManagement />
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/attendance-management" element={
              <ProtectedRoute>
                <div className="max-w-md w-full mx-auto min-h-screen bg-background relative overflow-x-hidden">
                  <AttendanceManagement />
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/users-management" element={
              <ProtectedRoute>
                <div className="max-w-md w-full mx-auto min-h-screen bg-background relative overflow-x-hidden">
                  <UsersManagement />
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/test-users" element={
              <ProtectedRoute>
                <div className="max-w-md w-full mx-auto min-h-screen bg-background relative overflow-x-hidden">
                  <TestUsersPage />
                  <BottomNav />
                </div>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
