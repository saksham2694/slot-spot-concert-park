
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AuthPrompt = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
      <p className="text-muted-foreground mb-6">
        Please log in to book a parking spot for this event.
      </p>
      <Button onClick={() => navigate("/")}>
        Go to Login
      </Button>
    </div>
  );
};

export default AuthPrompt;
