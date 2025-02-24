import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import LandingPage from "@/pages/landing-page";
import Book from "@/pages/book";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <>
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/auth" component={AuthPage} />
            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <Route path="/book" component={Book} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;