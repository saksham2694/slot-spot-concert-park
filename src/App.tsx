
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import AboutPage from "@/pages/AboutPage";
import EventsPage from "@/pages/EventsPage";
import EventDetail from "@/pages/EventDetail";
import UniversitiesPage from "@/pages/UniversitiesPage";
import UniversityDetail from "@/pages/UniversityDetail";
import AirportsPage from "@/pages/AirportsPage";
import AirportDetail from "@/pages/AirportDetail";
import BookingsPage from "@/pages/BookingsPage";
import BookingDetailPage from "@/pages/BookingDetailPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import AdminCreateEvent from "@/pages/admin/AdminCreateEvent";
import AdminUniversities from "@/pages/admin/AdminUniversities";
import AdminCreateUniversity from "@/pages/admin/AdminCreateUniversity";
import AdminAirports from "@/pages/admin/AdminAirports";
import AdminCreateAirport from "@/pages/admin/AdminCreateAirport";
import VendorLayout from "@/pages/vendor/VendorLayout";
import VendorDashboard from "@/pages/vendor/VendorDashboard";
import EventCheckIn from "@/pages/vendor/EventCheckIn";
import QRScanner from "@/pages/vendor/QRScanner";
import PaymentCallback from "@/pages/PaymentCallback";
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import VendorUniversities from "@/pages/vendor/VendorUniversities";
import UniversityCheckIn from "@/pages/vendor/UniversityCheckIn";
import VendorAirports from "@/pages/vendor/VendorAirports";
import AirportCheckIn from "@/pages/vendor/AirportCheckIn";

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route path="/universities" element={<UniversitiesPage />} />
          <Route path="/universities/:universityId" element={<UniversityDetail />} />
          <Route path="/airports" element={<AirportsPage />} />
          <Route path="/airports/:airportId" element={<AirportDetail />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/bookings/:bookingId" element={<BookingDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          
          {/* Vendor routes */}
          <Route path="/vendor" element={<VendorLayout />}>
            <Route index element={<VendorDashboard />} />
            <Route path="events/:eventId" element={<EventCheckIn />} />
            <Route path="universities" element={<VendorUniversities />} />
            <Route path="universities/:universityId" element={<UniversityCheckIn />} />
            <Route path="airports" element={<VendorAirports />} />
            <Route path="airports/:airportId" element={<AirportCheckIn />} />
            <Route path="scan-qr" element={<QRScanner />} />
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="events" element={<AdminCreateEvent />} />
            <Route path="universities" element={<AdminUniversities />} />
            <Route path="create-university" element={<AdminCreateUniversity />} />
            <Route path="airports" element={<AdminAirports />} />
            <Route path="create-airport" element={<AdminCreateAirport />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  );
}
