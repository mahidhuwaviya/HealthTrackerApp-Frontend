import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { GlassLoader } from "@/components/ui/GlassLoader";

const queryClient = new QueryClient();

import { GoogleAuthCallback } from "@/components/auth/GoogleAuthCallback";

const GlobalLoadingOverlay = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  if (isFetching > 0 || isMutating > 0) {
    const isDashboardLoading = isFetching > 0 && !isMutating;
    return (
      <GlassLoader
        state={isMutating > 0 ? "processing" : "fetching"}
        message={isMutating > 0 ? "Syncing with Database..." : "Updating Health Stats..."}
      />
    );
  }

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <GlobalLoadingOverlay />
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
