import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Pigs from "./pages/Pigs";
import PigProfile from "./pages/PigProfile";
import Nutrition from "./pages/Nutrition";
import Breeding from "./pages/Breeding";
import Health from "./pages/Health";
import Slaughter from "./pages/Slaughter";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pigs" element={<Pigs />} />
            <Route path="/pigs/:id" element={<PigProfile />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/breeding" element={<Breeding />} />
            <Route path="/health" element={<Health />} />
            <Route path="/slaughter" element={<Slaughter />} />
            <Route path="/farm-map" element={<PlaceholderPage title="Farm Map" description="Interactive farm map with pen layouts, water points, and feed stores." />} />
            <Route path="/reports" element={<PlaceholderPage title="Reports & Insights" description="FCR trends, feed usage, breeding success, and slaughter statistics." />} />
            <Route path="/audit" element={<PlaceholderPage title="Audit Log" description="Complete audit trail of all farm operations and user actions." />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
