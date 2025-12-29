import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Web3Provider } from "@/context/Web3Context";

// Lazy load pages for code-splitting
const Index = lazy(() => import("./pages/Index"));
const Stake = lazy(() => import("./pages/Stake"));
const NFT = lazy(() => import("./pages/nfts"));
const Swap = lazy(() => import("./pages/Swap"));
const Profile = lazy(() => import("./pages/Profile"));
const Market = lazy(() => import("./pages/Market"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-foreground/60 text-sm">Loading...</span>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <Web3Provider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/stake" element={<Stake />} />
                  <Route path="/nfts" element={<NFT />} />
                  <Route path="/swap" element={<Swap />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/market" element={<Market />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </Web3Provider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
