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
            <div className="h-12 w-12 rounded-md overflow-hidden flex items-center justify-center">
              <img 
                src="/lovable-uploads/0af6a5ad-8987-465d-9d4d-3ce8c79b0650.png" 
                alt="Time2Park Logo" 
                className="h-full w-full object-contain"
                style={{
                  imageRendering: "crisp-edges",
                  filter: "contrast(1.05) brightness(1.05)"
                }}
              />
            </div>
            <span className="font-bold text-xl md:text-2xl text-foreground" style={{ fontFamily: "'Poppins', sans-serif" }}>Time2Park</span>
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
