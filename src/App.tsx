import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/AppLayout";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Files from "@/pages/Files";
import Links from "@/pages/Links";
import Notes from "@/pages/Notes";
import Favorites from "@/pages/Favorites";
import Folders from "@/pages/Folders";
import FolderDetails from "@/pages/FolderDetails";
import NoteEditor from "@/pages/NoteEditor";
import Settings from "@/pages/Settings";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Auth from "@/pages/Auth";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, path }: { component: any; path: string }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  return <Route path={path} component={Component} />;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      
      {/* Publicly Accessible Dashboard & Assets */}
      <Route>
        <AppLayout>
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/files" component={Files} />
            <Route path="/links" component={Links} />
            <Route path="/notes" component={Notes} />
            <Route path="/notes/:id" component={NoteEditor} />
            <Route path="/favorites" component={Favorites} />
            <Route path="/folders" component={Folders} />
            <Route path="/folders/:id" component={FolderDetails} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
