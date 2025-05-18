
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle as ThemeToggle } from "@/components/ui/mode-toggle";
import {
  User,
  Ticket,
  LogOut,
  ShieldCheck,
  Store,
  Menu,
  X,
  Building,
  Plane,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getInitials } from "@/lib/utils";
import AuthModal from "@/components/AuthModal";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const Navbar = () => {
  const { user, profile, signOut, checkIfAdmin, checkIfVendor } = useAuth();
  const { theme } = useTheme();
  const [authModal, setAuthModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isVendor, setIsVendor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    const checkUserRoles = async () => {
      if (user) {
        try {
          const isAdminUser = await checkIfAdmin?.();
          setIsAdmin(!!isAdminUser);
          
          const isVendorUser = await checkIfVendor?.();
          setIsVendor(!!isVendorUser);
        } catch (error) {
          console.error("Error checking user roles:", error);
        }
      }
    };
    
    checkUserRoles();
  }, [user, checkIfAdmin, checkIfVendor]);

  if (!mounted) {
    return null;
  }

  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center font-semibold">
            <span className="text-2xl">
              Time2Park
            </span>
          </Link>
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 flex md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Explore Time2Park
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <Link to="/" className="text-lg font-medium hover:text-primary transition-colors flex items-center justify-between">
                  Home
                  <X className="h-5 w-5" />
                </Link>
                <Link to="/events" className="text-lg font-medium hover:text-primary transition-colors flex items-center justify-between">
                  Events
                  <X className="h-5 w-5" />
                </Link>
                <Link to="/universities" className="text-lg font-medium hover:text-primary transition-colors flex items-center justify-between">
                  Universities
                  <X className="h-5 w-5" />
                </Link>
                <Link to="/airports" className="text-lg font-medium hover:text-primary transition-colors flex items-center justify-between">
                  Airports
                  <X className="h-5 w-5" />
                </Link>
                <Link to="/about" className="text-lg font-medium hover:text-primary transition-colors flex items-center justify-between">
                  About
                  <X className="h-5 w-5" />
                </Link>
                {user ? (
                  <>
                    <Link to="/bookings" className="text-lg font-medium hover:text-primary transition-colors flex items-center justify-between">
                      My Bookings
                      <X className="h-5 w-5" />
                    </Link>
                    <Link to="/profile" className="text-lg font-medium hover:text-primary transition-colors flex items-center justify-between">
                      Profile
                      <X className="h-5 w-5" />
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="text-lg font-medium hover:text-primary transition-colors flex items-center justify-between">
                        Admin Dashboard
                        <X className="h-5 w-5" />
                      </Link>
                    )}
                    {isVendor && (
                      <Link to="/vendor" className="text-lg font-medium hover:text-primary transition-colors flex items-center justify-between">
                        Vendor Dashboard
                        <X className="h-5 w-5" />
                      </Link>
                    )}
                    <Button variant="secondary" onClick={handleSignOut}>Sign Out</Button>
                  </>
                ) : (
                  <Button variant="secondary" onClick={() => setAuthModal(true)}>Sign In</Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link to="/" className="px-3 py-2 text-lg font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/events" className="px-3 py-2 text-lg font-medium hover:text-primary transition-colors">
              Events
            </Link>
            <Link to="/universities" className="px-3 py-2 text-lg font-medium hover:text-primary transition-colors">
              Universities
            </Link>
            <Link to="/airports" className="px-3 py-2 text-lg font-medium hover:text-primary transition-colors">
              Airports
            </Link>
            <Link to="/about" className="px-3 py-2 text-lg font-medium hover:text-primary transition-colors">
              About
            </Link>
          </nav>
          
          {/* Account Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0" aria-label="User menu">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(profile?.first_name || "", profile?.last_name || "")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-normal text-sm text-muted-foreground">Signed in as</div>
                    <div className="font-medium text-foreground">
                      {profile?.first_name} {profile?.last_name}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/bookings">
                      <Ticket className="mr-2 h-4 w-4" />
                      <span>My Bookings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {isVendor && (
                    <DropdownMenuItem asChild>
                      <Link to="/vendor">
                        <Store className="mr-2 h-4 w-4" />
                        <span>Vendor Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="secondary" onClick={() => setAuthModal(true)}>Sign In</Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal open={authModal} onOpenChange={setAuthModal} />
    </header>
  );
};

export default Navbar;
