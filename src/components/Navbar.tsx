
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import AuthButton from "@/components/ui/auth-button";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

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
                <AuthButton className="w-full" />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center space-x-6">
            <NavLinks />
            <AuthButton />
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
