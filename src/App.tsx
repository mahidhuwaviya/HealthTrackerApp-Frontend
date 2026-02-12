import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

import { GoogleAuthCallback } from "@/components/auth/GoogleAuthCallback";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <Switch>
              <Route path="/" component={LandingPage} />
              <Route path="/login" component={LoginPage} />

              {/* Oauth Success Route */}
              <Route path="/auth/google-auth" component={GoogleAuthCallback} />


              <Route path="/dashboard">
                {() => <ProtectedRoute component={DashboardPage} />}
              </Route>
              <Route path="/dashboard/:subpage*">
                {() => <ProtectedRoute component={DashboardPage} />}
              </Route>

              <Route component={NotFound} />
            </Switch>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
