import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import AuthButton from "@/components/ui/auth-button";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
    { name: "My Bookings", path: "/bookings" },
    { name: "About", path: "/about" },
  ];

  const NavLinks = () => (
    <div className={`flex ${isMobile ? "flex-col space-y-4" : "space-x-6"}`}>
      {navLinks.map((link) => (
        <Link
          key={link.name}
          to={link.path}
          className="text-foreground hover:text-primary transition-colors"
          onClick={() => setIsOpen(false)}
        >
          {link.name}
        </Link>
      ))}
    </div>
  );

  const UserMenu = () => {
    if (!user) return null;

    const userInitials = user.email ? user.email.substring(0, 2).toUpperCase() : "U";
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/admin" className="flex items-center">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className="border-b sticky top-0 z-30 bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary rounded-md p-1">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-6 w-6 text-primary-foreground"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 8h.01" />
                <path d="M17 8h.01" />
                <path d="M7 12h.01" />
                <path d="M17 12h.01" />
                <path d="M7 16h.01" />
                <path d="M17 16h.01" />
              </svg>
            </div>
            <span className="font-bold text-lg text-foreground">SlotSpot</span>
          </Link>
        </div>

        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col pt-16">
              <NavLinks />
              <div className="mt-6">
                {user ? (
                  <>
                    <Button asChild variant="outline" className="w-full mb-2">
                      <Link to="/admin" onClick={() => setIsOpen(false)}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </Button>
                    <Button onClick={signOut} className="w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </Button>
                  </>
                ) : (
                  <AuthButton className="w-full" />
                )}
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center space-x-6">
            <NavLinks />
            {user ? <UserMenu /> : <AuthButton />}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
