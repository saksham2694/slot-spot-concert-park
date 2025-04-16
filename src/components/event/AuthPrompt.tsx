
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const AuthPrompt = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
      <p className="text-muted-foreground mb-6">
        Please log in to view your bookings.
      </p>
      <Button>
        <LogIn className="mr-2 h-4 w-4" />
        Log In
      </Button>
    </div>
  );
};

export default AuthPrompt;
