
import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ExternalLink, LayoutGrid, Building, Plane, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VendorLayout = () => {
  const navigate = useNavigate();
  const { user, checkIfVendor } = useAuth();
  const { toast } = useToast();
  const [isVendor, setIsVendor] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkVendorRole = async () => {
      if (!user) {
        toast({
          title: "Access denied",
          description: "Please sign in to access the vendor dashboard",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      try {
        // Check if the user has the vendor role
        const hasVendorRole = await checkIfVendor();
        setIsVendor(hasVendorRole);
        
        if (!hasVendorRole) {
          toast({
            title: "Access denied",
            description: "You do not have vendor permissions to access this area",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking vendor status:", error);
        toast({
          title: "Something went wrong",
          description: "Could not verify your access permissions",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setIsChecking(false);
      }
    };

    checkVendorRole();
  }, [user, navigate, toast]);

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (!isVendor) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
        <Link to="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Back to Main Site
          </Button>
        </Link>
      </div>
      
      <div className="mb-6 border-b pb-4">
        <nav className="flex space-x-4">
          <NavLink 
            to="/vendor" 
            end
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Dashboard
          </NavLink>
          <NavLink 
            to="/vendor/events" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Events
          </NavLink>
          <NavLink 
            to="/vendor/universities" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Building className="h-4 w-4 mr-2" />
            Universities
          </NavLink>
          <NavLink 
            to="/vendor/airports" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Plane className="h-4 w-4 mr-2" />
            Airports
          </NavLink>
        </nav>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm border p-4 md:p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default VendorLayout;
