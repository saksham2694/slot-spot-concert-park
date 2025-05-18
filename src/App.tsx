
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeProvider";
import Index from "./pages/Index";
import EventDetail from "./pages/EventDetail";
import EventsPage from "./pages/EventsPage";
import BookingsPage from "./pages/BookingsPage";
import BookingDetailPage from "./pages/BookingDetailPage";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import PaymentCallback from "./pages/PaymentCallback";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCreateEvent from "./pages/admin/AdminCreateEvent";
import UserManagement from "./pages/admin/UserManagement";

// Vendor routes
import VendorLayout from "./pages/vendor/VendorLayout";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import EventCheckIn from "./pages/vendor/EventCheckIn";
import QRScanner from "./pages/vendor/QRScanner";

// University routes
import UniversitiesPage from "./pages/UniversitiesPage";
import UniversityDetail from "./pages/UniversityDetail";

// Airport routes
import AirportsPage from "./pages/AirportsPage";
import AirportDetail from "./pages/AirportDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="time2park-theme">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:eventId" element={<EventDetail />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/bookings/:bookingId" element={<BookingDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/payment-callback" element={<PaymentCallback />} />
              
              {/* University Routes */}
              <Route path="/universities" element={<UniversitiesPage />} />
              <Route path="/universities/:universityId" element={<UniversityDetail />} />
              
              {/* Airport Routes */}
              <Route path="/airports" element={<AirportsPage />} />
              <Route path="/airports/:airportId" element={<AirportDetail />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="create-event" element={<AdminCreateEvent />} />
                <Route path="users" element={<UserManagement />} />
              </Route>
              
              {/* Vendor Routes */}
              <Route path="/vendor" element={<VendorLayout />}>
                <Route index element={<VendorDashboard />} />
                <Route path="events/:eventId" element={<EventCheckIn />} />
                <Route path="scan-qr" element={<QRScanner />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
