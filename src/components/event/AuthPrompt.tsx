
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AuthButton from "@/components/ui/auth-button";

const AuthPrompt = () => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
      <p className="text-muted-foreground mb-6">
        Please log in to view your bookings.
      </p>
      
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <LogIn className="mr-2 h-4 w-4" />
              Log In
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="pt-10">
            <div className="flex flex-col gap-4 mt-8">
              <p className="text-center text-muted-foreground mb-4">
                Please log in to continue
              </p>
              <AuthButton className="w-full" />
            </div>
          </SheetContent>
        </Sheet>
      ) : null}
    </div>
  );
};

export default AuthPrompt;
