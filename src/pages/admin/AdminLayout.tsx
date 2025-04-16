
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const AdminLayout = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Protected route - redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/");
    }
    // In a real application, you would also check if the user has admin privileges
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-6 flex-1">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button asChild variant="outline">
            <Link to="/">Back to Site</Link>
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="mb-6">
          <TabsList>
            <TabsTrigger value="dashboard" asChild>
              <Link to="/admin">Dashboard</Link>
            </TabsTrigger>
            <TabsTrigger value="create-event" asChild>
              <Link to="/admin/create-event">Create Event</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
