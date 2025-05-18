
import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  LayoutDashboard,
  CalendarPlus,
  Users,
  Loader2,
  Building,
  Plane
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, checkIfAdmin } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [redirectAttempted, setRedirectAttempted] = useState<boolean>(false);

  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/admin") return "dashboard";
    if (path.includes("/admin/create-event")) return "create-event";
    if (path.includes("/admin/users")) return "users";
    if (path.includes("/admin/universities") || path.includes("/admin/create-university")) return "universities";
    if (path.includes("/admin/airports") || path.includes("/admin/create-airport")) return "airports";
    return "dashboard";
  };

  useEffect(() => {
    // Reset redirect attempt when user changes
    if (user) {
      setRedirectAttempted(false);
    }
  }, [user]);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        if (!redirectAttempted) {
          setRedirectAttempted(true);
          toast({
            title: "Access denied",
            description: "Please sign in to access the admin dashboard",
            variant: "destructive",
          });
          navigate("/");
        }
        return;
      }

      try {
        const isUserAdmin = await checkIfAdmin();
        setIsAdmin(isUserAdmin);
        
        if (!isUserAdmin && !redirectAttempted) {
          setRedirectAttempted(true);
          toast({
            title: "Access denied",
            description: "You do not have permission to access this area",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        if (!redirectAttempted) {
          setRedirectAttempted(true);
          toast({
            title: "Something went wrong",
            description: "Could not verify your access permissions",
            variant: "destructive",
          });
          navigate("/");
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminRole();
  }, [user, checkIfAdmin, navigate, toast, redirectAttempted]);

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <Tabs defaultValue={getActiveTab()} className="w-full">
          <TabsList className="mb-6 flex flex-wrap">
            <Link to="/admin">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
            </Link>
            <Link to="/admin/create-event">
              <TabsTrigger value="create-event" className="flex items-center gap-2">
                <CalendarPlus className="h-4 w-4" />
                Create Event
              </TabsTrigger>
            </Link>
            <Link to="/admin/universities">
              <TabsTrigger value="universities" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Universities
              </TabsTrigger>
            </Link>
            <Link to="/admin/airports">
              <TabsTrigger value="airports" className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Airports
              </TabsTrigger>
            </Link>
            <Link to="/admin/users">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
            </Link>
          </TabsList>
        </Tabs>
      </div>
      <div className="bg-card rounded-lg shadow-sm border p-4 md:p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
