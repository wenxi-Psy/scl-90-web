import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Link } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import { BarChart3 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

function Router() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-indigo-600 hover:text-indigo-700">
            <span>SCL-90</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
              评估
            </Link>
            {/* Only show analytics link to admin users */}
            {isAdmin && (
              <Link href="/analytics" className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
                <BarChart3 className="w-4 h-4" />
                分析
              </Link>
            )}
          </div>
        </div>
      </nav>

      <Switch>
        <Route path="/" component={Home} />
        {/* Analytics route only accessible to admin */}
        {isAdmin && <Route path="/analytics" component={Analytics} />}
        <Route path="/404" component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
