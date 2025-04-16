import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AdminLayout = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        try {
          const { data, error } = await supabase.rpc('is_admin');
          
          if (error) {
            console.error('Error checking admin role:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(data);
          }
        } catch (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        } finally {
          setIsChecking(false);
        }
      } else {
        setIsAdmin(false);
        setIsChecking(false);
      }
    };

    if (!isLoading) {
      checkAdminRole();
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (!isLoading && !isChecking) {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to access the admin dashboard",
          variant: "destructive"
        });
        navigate("/");
      } else if (!isAdmin) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access the admin dashboard",
          variant: "destructive"
        });
        navigate("/");
      }
    }
  }, [user, isAdmin, isLoading, isChecking, navigate, toast]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access the admin dashboard. Please contact an administrator if you believe this is an error.
          </AlertDescription>
        </Alert>
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
