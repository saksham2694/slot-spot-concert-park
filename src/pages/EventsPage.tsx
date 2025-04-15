
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard, { Event } from "@/components/EventCard";
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

// Extended mock data for the events page
const mockEvents: Event[] = [
  {
    id: 1,
    title: "Taylor Swift: The Eras Tour",
    date: "May 20, 2025",
    time: "7:00 PM - 11:00 PM",
    location: "SoFi Stadium, Los Angeles",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    parkingAvailable: 123,
    parkingTotal: 500
  },
  {
    id: 2,
    title: "Coldplay: Music of the Spheres World Tour",
    date: "June 15, 2025",
    time: "6:30 PM - 10:30 PM",
    location: "MetLife Stadium, New Jersey",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    parkingAvailable: 42,
    parkingTotal: 400
  },
  {
    id: 3,
    title: "Beyoncé: Renaissance World Tour",
    date: "July 8, 2025",
    time: "8:00 PM - 11:30 PM",
    location: "Mercedes-Benz Stadium, Atlanta",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    parkingAvailable: 350,
    parkingTotal: 600
  },
  {
    id: 4,
    title: "Ed Sheeran: Mathematics Tour",
    date: "August 12, 2025",
    time: "7:30 PM - 10:30 PM",
    location: "Wembley Stadium, London",
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    parkingAvailable: 75,
    parkingTotal: 450
  },
  {
    id: 5,
    title: "NBA Finals Game 7",
    date: "June 18, 2025",
    time: "8:00 PM - 11:00 PM",
    location: "Madison Square Garden, New York",
    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80",
    parkingAvailable: 210,
    parkingTotal: 350
  },
  {
    id: 6,
    title: "Bruno Mars World Tour",
    date: "July 22, 2025",
    time: "7:00 PM - 10:30 PM",
    location: "T-Mobile Arena, Las Vegas",
    image: "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80",
    parkingAvailable: 180,
    parkingTotal: 300
  },
  {
    id: 7,
    title: "Comic-Con International",
    date: "July 25-28, 2025",
    time: "9:00 AM - 7:00 PM",
    location: "San Diego Convention Center",
    image: "https://images.unsplash.com/photo-1608889175250-c3b0c1667d3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
    parkingAvailable: 420,
    parkingTotal: 800
  },
  {
    id: 8,
    title: "U2: UV Achtung Baby Live",
    date: "September 5, 2025",
    time: "8:30 PM - 11:30 PM",
    location: "Sphere, Las Vegas",
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
    parkingAvailable: 95,
    parkingTotal: 450
  }
];

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState(0);

  useEffect(() => {
    // Simulate API call
    const fetchEvents = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEvents(mockEvents);
        setFilteredEvents(mockEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedDate) count++;
    if (selectedLocation) count++;
    setActiveFilters(count);

    // Apply filters
    let results = [...events];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        event => 
          event.title.toLowerCase().includes(query) || 
          event.location.toLowerCase().includes(query)
      );
    }
    
    if (selectedDate) {
      const formattedSelectedDate = format(selectedDate, "MMMM d, yyyy");
      results = results.filter(event => {
        // Handle date ranges like "July 25-28, 2025"
        if (event.date.includes("-")) {
          const [startDateStr] = event.date.split("-");
          const year = event.date.split(",")[1].trim();
          const fullStartDate = `${startDateStr}, ${year}`;
          // This is a simplified check - in real app would need more robust date parsing
          return fullStartDate.includes(format(selectedDate, "MMMM d")) || 
                 event.date.includes(format(selectedDate, "MMMM d"));
        }
        return event.date.includes(format(selectedDate, "MMMM d"));
      });
    }
    
    if (selectedLocation) {
      results = results.filter(event => 
        event.location.includes(selectedLocation)
      );
    }
    
    setFilteredEvents(results);
  }, [searchQuery, selectedDate, selectedLocation, events]);

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
                  <SelectItem value="">All Locations</SelectItem>
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
          {loading ? (
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
