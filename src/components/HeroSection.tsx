import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CalendarIcon } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/events");
  };

  return (
    <section className="relative">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-parking-primary to-parking-secondary opacity-90">
        <div className="absolute inset-0 bg-black opacity-60"></div>
      </div>
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoMTJWMThIMzZ2MTJ6TTYgMTJIMFY2aDZWMHY2ek00OCAyNFYwSDI0djI0SDBoMjR2MjRoMjRWMjR6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
      
      {/* Content */}
      <div className="relative container mx-auto px-4 py-32 sm:px-6 md:py-40 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Find and Reserve the Perfect Parking Spot
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8">
            Book your parking space in advance for concerts, sports events and more
          </p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10 pr-4 py-6 bg-white text-foreground rounded-lg w-full"
                placeholder="Search events, venues, or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
            
            <Button 
              type="submit" 
              className="bg-parking-primary text-white rounded-lg py-6"
            >
              Search
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
