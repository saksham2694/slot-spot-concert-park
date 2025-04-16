
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Filter, CalendarIcon, Search, X } from "lucide-react";
import { Event } from "@/types/event";
import { fetchEvents } from "@/services/eventService";
import { useQuery } from "@tanstack/react-query";

const EventsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState(0);

  // Fetch events using React Query
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  // Apply filters
  const filteredEvents = events.filter(event => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!event.title.toLowerCase().includes(query) && 
          !event.location.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    // Apply date filter
    if (selectedDate) {
      const formattedSelectedDate = format(selectedDate, "MMMM d, yyyy");
      // Handle date ranges like "July 25-28, 2025"
      if (event.date.includes("-")) {
        const [startDateStr] = event.date.split("-");
        const year = event.date.split(",")[1]?.trim();
        const fullStartDate = `${startDateStr}, ${year}`;
        if (!fullStartDate.includes(format(selectedDate, "MMMM d")) && 
            !event.date.includes(format(selectedDate, "MMMM d"))) {
          return false;
        }
      } else if (!event.date.includes(format(selectedDate, "MMMM d"))) {
        return false;
      }
    }
    
    // Apply location filter
    if (selectedLocation && selectedLocation !== "all-locations") {
      if (!event.location.includes(selectedLocation)) {
        return false;
      }
    }
    
    return true;
  });

  // Calculate active filters
  useState(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedDate) count++;
    if (selectedLocation && selectedLocation !== "all-locations") count++;
    setActiveFilters(count);
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDate(undefined);
    setSelectedLocation("");
  };

  // Extract unique locations for the dropdown
  const locations = [...new Set(events.map(event => {
    const parts = event.location.split(',');
    return parts[parts.length - 1].trim(); // Get the city or last part
  }))];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Page Header */}
        <div className="bg-muted py-8">
          <div className="container">
            <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search events, venues, or locations..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-locations">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {activeFilters > 0 && (
                <Button variant="ghost" onClick={clearFilters} className="w-full md:w-auto">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters ({activeFilters})
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Events List */}
        <div className="container py-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-muted inline-flex p-3 rounded-full mb-4">
                <Filter className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No matching events found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search filters or check back later for new events.
              </p>
              <Button onClick={clearFilters}>Clear All Filters</Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EventsPage;
