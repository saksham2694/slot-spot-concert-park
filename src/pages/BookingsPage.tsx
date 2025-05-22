import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Download, ExternalLink, MapPin, QrCode, Building, Plane } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchBookingsForUser } from "@/services/bookingService";
import { fetchUniversityBookingsForUser } from "@/services/universityBookingService";
import { fetchAirportBookingsForUser } from "@/services/airportBookingService";
import { useAuth } from "@/context/AuthContext";
import { downloadBookingPDF, showQRCode } from "@/services/pdfService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Event } from "@/types/event";
import { ParkingSlot } from "@/types/parking";
import AuthPrompt from "@/components/event/AuthPrompt";
import { supabase } from "@/integrations/supabase/client";

interface EventBooking {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  parkingSpots: string[];
  totalPrice: number;
  status: "upcoming" | "completed";
  type: "event";
}

interface UniversityBooking {
  id: string;
  universityId: string;
  universityName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  location: string;
  parkingSpots: string[];
  totalPrice: number;
  status: "upcoming" | "completed";
  type: "university";
}

interface AirportBooking {
  id: string;
  airportId: string;
  airportName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  location: string;
  parkingSpots: string[];
  totalPrice: number;
  status: "upcoming" | "completed";
  type: "airport";
}

type Booking = EventBooking | UniversityBooking | AirportBooking;

const BookingsPage = () => {
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedQRCode, setSelectedQRCode] = useState<string | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState<boolean>(false);

  // Fetch event bookings
  const { 
    data: eventBookings = [], 
    isLoading: eventBookingsLoading, 
    error: eventBookingsError 
  } = useQuery({
    queryKey: ["eventBookings", user?.id],
    queryFn: () => user ? fetchBookingsForUser(user.id) : Promise.resolve([]),
    enabled: !!user,
    retry: false,
  });

  // Fetch university bookings
  const { 
    data: universityBookingsData = [], 
    isLoading: universityBookingsLoading, 
    error: universityBookingsError 
  } = useQuery({
    queryKey: ["universityBookings", user?.id],
    queryFn: async () => {
      if (!user) return Promise.resolve([]);
      
      // Fetch booking data
      const bookings = await fetchUniversityBookingsForUser(user.id);
      
      // Fetch university details for each booking
      const bookingsWithDetails = await Promise.all(
        bookings.map(async (booking) => {
          try {
            // Get university details
            const { data: universityData, error: universityError } = await supabase
              .from("universities")
              .select("name, location")
              .eq("id", booking.university_id)
              .single();
            
            if (universityError) {
              console.error("Error fetching university details:", universityError);
              return {
                ...booking,
                university_name: "University",
                location: "Unknown Location"
              };
            }
            
            // Get booking slots to determine parking spots
            const { data: bookingSlots, error: bookingSlotsError } = await supabase
              .from("university_booking_slots")
              .select(`
                parking_layout_id,
                university_parking_layouts (
                  row_number,
                  column_number
                )
              `)
              .eq("booking_id", booking.id);
            
            let parkingSpots: string[] = [];
            
            if (!bookingSlotsError && bookingSlots) {
              parkingSpots = bookingSlots.map(slot => {
                const layout = slot.university_parking_layouts;
                return `R${layout.row_number}C${layout.column_number}`;
              });
            }
            
            return {
              ...booking,
              university_name: universityData.name || "University",
              location: universityData.location || "Unknown Location",
              parking_spots: parkingSpots
            };
          } catch (error) {
            console.error("Error fetching details for university booking:", error);
            return booking;
          }
        })
      );
      
      return bookingsWithDetails;
    },
    enabled: !!user,
    retry: false,
  });

  // Fetch airport bookings
  const { 
    data: airportBookingsData = [], 
    isLoading: airportBookingsLoading, 
    error: airportBookingsError 
  } = useQuery({
    queryKey: ["airportBookings", user?.id],
    queryFn: async () => {
      if (!user) return Promise.resolve([]);
      
      // Fetch booking data
      const bookings = await fetchAirportBookingsForUser(user.id);
      
      // Fetch airport details for each booking
      const bookingsWithDetails = await Promise.all(
        bookings.map(async (booking) => {
          try {
            // Get airport details
            const { data: airportData, error: airportError } = await supabase
              .from("airports")
              .select("name, location")
              .eq("id", booking.airport_id)
              .single();
            
            if (airportError) {
              console.error("Error fetching airport details:", airportError);
              return {
                ...booking,
                airport_name: "Airport",
                location: "Unknown Location"
              };
            }
            
            // Get booking slots to determine parking spots
            const { data: bookingSlots, error: bookingSlotsError } = await supabase
              .from("airport_booking_slots")
              .select(`
                parking_layout_id,
                airport_parking_layouts (
                  row_number,
                  column_number
                )
              `)
              .eq("booking_id", booking.id);
            
            let parkingSpots: string[] = [];
            
            if (!bookingSlotsError && bookingSlots) {
              parkingSpots = bookingSlots.map(slot => {
                const layout = slot.airport_parking_layouts;
                return `R${layout.row_number}C${layout.column_number}`;
              });
            }
            
            return {\n              ...booking,\n              airport_name: airportData.name || \"Airport\",\n              location: airportData.location || \"Unknown Location\",\n              parking_spots: parkingSpots\n            };\n          } catch (error) {\n            console.error(\"Error fetching details for airport booking:\", error);\n            return booking;\n          }\n        })\n      );\n      \n      return bookingsWithDetails;\n    },\n    enabled: !!user,\n    retry: false,\n  });\n\n  // Check for errors\n  useEffect(() => {\n    const errors = [eventBookingsError, universityBookingsError, airportBookingsError].filter(Boolean);\n    if (errors.length) {\n      console.error(\"Error fetching bookings:\", errors);\n      toast({\n        title: \"Error\",\n        description: \"Failed to load some of your bookings. Please try again.\",\n        variant: \"destructive\",\n      });\n    }\n  }, [eventBookingsError, universityBookingsError, airportBookingsError, toast]);\n\n  // Transform university bookings to common format\n  const universityBookings = universityBookingsData.map(booking => {\n    const startDate = new Date(booking.start_date);\n    const endDate = new Date(booking.end_date);\n    const now = new Date();\n\n    let status: \"upcoming\" | \"completed\" = \"upcoming\";\n    if (booking.status === \"cancelled\") {\n      return null; // Skip cancelled bookings\n    } else if (endDate < now) {\n      status = \"completed\";\n    }\n\n    // Format dates\n    const formattedDate = startDate.toLocaleDateString(\"en-US\", {\n      year: \"numeric\",\n      month: \"long\",\n      day: \"numeric\",\n    });\n\n    const startTime = startDate.toLocaleTimeString(\"en-US\", {\n      hour: \"numeric\",\n      minute: \"2-digit\",\n      hour12: true,\n    });\n\n    const endTime = endDate.toLocaleTimeString(\"en-US\", {\n      hour: \"numeric\",\n      minute: \"2-digit\",\n      hour12: true,\n    });\n\n    // Use the parking_spots array from the enhanced query if available\n    const parkingSpots = booking.parking_spots || [];\n\n    return {\n      id: booking.id,\n      universityId: booking.university_id,\n      universityName: booking.university_name || \"University\",\n      bookingDate: formattedDate,\n      startTime,\n      endTime,\n      location: booking.location || \"\",\n      parkingSpots,\n      totalPrice: booking.payment_amount || 0,\n      status,\n      type: \"university\" as const\n    };\n  }).filter(Boolean) as UniversityBooking[];\n\n  // Transform airport bookings to common format\n  const airportBookings = airportBookingsData.map(booking => {\n    const startDate = new Date(booking.start_date);\n    const endDate = new Date(booking.end_date);\n    const now = new Date();\n\n    let status: \"upcoming\" | \"completed\" = \"upcoming\";\n    if (booking.status === \"cancelled\") {\n      return null; // Skip cancelled bookings\n    } else if (endDate < now) {\n      status = \"completed\";\n    }\n\n    // Format dates\n    const formattedDate = startDate.toLocaleDateString(\"en-US\", {\n      year: \"numeric\",\n      month: \"long\",\n      day: \"numeric\",\n    });\n\n    const startTime = startDate.toLocaleTimeString(\"en-US\", {\n      hour: \"numeric\",\n      minute: \"2-digit\",\n      hour12: true,\n    });\n\n    const endTime = endDate.toLocaleTimeString(\"en-US\", {\n      hour: \"numeric\",\n      minute: \"2-digit\",\n      hour12: true,\n    });\n\n    // Use the parking_spots array from the enhanced query if available\n    const parkingSpots = booking.parking_spots || [];\n\n    return {\n      id: booking.id,\n      airportId: booking.airport_id,\n      airportName: booking.airport_name || \"Airport\",\n      bookingDate: formattedDate,\n      startTime,\n      endTime,\n      location: booking.location || \"\",\n      parkingSpots,\n      totalPrice: booking.payment_amount || 0,\n      status,\n      type: \"airport\" as const\n    };\n  }).filter(Boolean) as AirportBooking[];\n\n  // Transform event bookings\n  const transformedEventBookings = eventBookings.reduce<EventBooking[]>((acc, booking) => {\n    if (!booking.events) return acc;\n    \n    const eventDate = new Date(booking.events.date);\n    const now = new Date();\n    \n    let status: \"upcoming\" | \"completed\" = \"upcoming\";\n    \n    // Skip cancelled bookings entirely\n    if (booking.status === \"cancelled\") {\n      return acc;\n    } \n    // If the event date is in the past, mark it as completed\n    else if (eventDate < now) {\n      status = \"completed\";\n    }\n\n    // Format the event date and time\n    const formattedDate = eventDate.toLocaleDateString(\"en-US\", {\n      year: \"numeric\",\n      month: \"long\",\n      day: \"numeric\",\n    });\n    \n    const formattedTime = eventDate.toLocaleTimeString(\"en-US\", {\n      hour: \"numeric\",\n      minute: \"2-digit\",\n      hour12: true,\n    });\n\n    // Extract parking spots from booking_slots\n    const parkingSpots = booking.booking_slots?.map(slot => \n      `R${slot.parking_layouts.row_number}C${slot.parking_layouts.column_number}`\n    ) || [];\n\n    // Calculate total price\n    const totalPrice = booking.booking_slots?.reduce((total, slot) => \n      total + (slot.parking_layouts.price || 0), 0\n    ) || 0;\n\n    const transformedBooking: EventBooking = {\n      id: booking.id,\n      eventId: booking.event_id || \"\",\n      eventName: booking.events.title,\n      eventDate: formattedDate,\n      eventTime: `${formattedTime} - ${new Date(eventDate.getTime() + 3 * 60 * 60 * 1000).toLocaleTimeString(\"en-US\", {\n        hour: \"numeric\",\n        minute: \"2-digit\",\n        hour12: true,\n      })}`,\n      location: booking.events.location,\n      parkingSpots,\n      totalPrice,\n      status,\n      type: \"event\"\n    };\n\n    acc.push(transformedBooking);\n    return acc;\n  }, []);\n\n  // Combine all bookings\n  const allBookings: Booking[] = [\n    ...transformedEventBookings,\n    ...universityBookings,\n    ...airportBookings\n  ];\n\n  // Filter bookings by status and category\n  const filteredBookings = allBookings.filter(booking => {\n    if (activeCategory === 'all') {\n      return booking.status === activeTab;\n    } else {\n      return booking.status === activeTab && booking.type === activeCategory;\n    }\n  });\n\n  // Group bookings by type\n  const bookingsByType = {\n    all: {\n      upcoming: allBookings.filter(b => b.status === 'upcoming'),\n      completed: allBookings.filter(b => b.status === 'completed')\n    },\n    event: {\n      upcoming: transformedEventBookings.filter(b => b.status === 'upcoming'),\n      completed: transformedEventBookings.filter(b => b.status === 'completed')\n    },\n    university: {\n      upcoming: universityBookings.filter(b => b.status === 'upcoming'),\n      completed: universityBookings.filter(b => b.status === 'completed')\n    },\n    airport: {\n      upcoming: airportBookings.filter(b => b.status === 'upcoming'),\n      completed: airportBookings.filter(b => b.status === 'completed')\n    }\n  };\n\n  const handleShowQR = (bookingId: string) => {\n    // Generate QR code data\n    const qrCodeData = `TIME2PARK-BOOKING-${bookingId}`;\n    setSelectedQRCode(qrCodeData);\n    setQrDialogOpen(true);\n  };\n\n  const handleDownloadTicket = (booking: Booking) => {\n    let mockEvent: Event;\n    \n    // Create appropriate mock event data based on booking type\n    if (booking.type === \"event\") {\n      mockEvent = {\n        id: booking.eventId,\n        title: booking.eventName,\n        date: booking.eventDate,\n        time: booking.eventTime,\n        location: booking.location,\n        image: \"\",\n        parkingAvailable: 0,\n        parkingTotal: 0,\n        parkingPrice: booking.totalPrice / booking.parkingSpots.length\n      };\n    } else if (booking.type === \"university\") {\n      mockEvent = {\n        id: booking.universityId,\n        title: booking.universityName,\n        date: booking.bookingDate,\n        time: `${booking.startTime} - ${booking.endTime}`,\n        location: booking.location,\n        image: \"\",\n        parkingAvailable: 0,\n        parkingTotal: 0,\n        parkingPrice: booking.totalPrice / booking.parkingSpots.length\n      };\n    } else {\n      mockEvent = {\n        id: booking.airportId,\n        title: booking.airportName,\n        date: booking.bookingDate,\n        time: `${booking.startTime} - ${booking.endTime}`,\n        location: booking.location,\n        image: \"\",\n        parkingAvailable: 0,\n        parkingTotal: 0,\n        parkingPrice: booking.totalPrice / booking.parkingSpots.length\n      };\n    }\n    \n    // Create mock slots\n    const mockSlots: ParkingSlot[] = booking.parkingSpots.map((spotId, index) => ({\n      id: spotId,\n      state: \"reserved\",\n      row: parseInt(spotId.charAt(1)),\n      column: parseInt(spotId.charAt(3)),\n      price: booking.totalPrice / booking.parkingSpots.length\n    }));\n    \n    const qrCodeData = `TIME2PARK-BOOKING-${booking.id}`;\n    \n    downloadBookingPDF(mockEvent, mockSlots, booking.id, qrCodeData)\n      .then(() => {\n        toast({\n          title: \"Ticket Downloaded\",\n          description: `Ticket for booking ${booking.id.substring(0, 8)} has been downloaded.`,\n        });\n      })\n      .catch(error => {\n        console.error(\"Error downloading ticket:\", error);\n        toast({\n          title: \"Download Failed\",\n          description: \"Could not download the ticket. Please try again.\",\n          variant: \"destructive\",\n        });\n      });\n  };\n\n  const isLoading = eventBookingsLoading || universityBookingsLoading || airportBookingsLoading;\n\n  const BookingsList = ({ items, type }: { items: Booking[], type: string }) => {\n    if (items.length === 0) {\n      return (\n        <div className=\"text-center py-12\">\n          <p className=\"text-muted-foreground mb-4\">\n            {type === \"upcoming\" \n              ? `You don't have any upcoming ${activeCategory !== 'all' ? activeCategory : ''} bookings.` \n              : `You don't have any completed ${activeCategory !== 'all' ? activeCategory : ''} bookings.`}\n          </p>\n          {type === \"upcoming\" && (\n            <div className=\"space-x-4\">\n              {(activeCategory === 'all' || activeCategory === 'event') && (\n                <Link to=\"/events\">\n                  <Button className=\"mr-2\">Find Events</Button>\n                </Link>\n              )}\n              {(activeCategory === 'all' || activeCategory === 'university') && (\n                <Link to=\"/universities\">\n                  <Button className=\"mr-2\" variant=\"outline\">Find Universities</Button>\n                </Link>\n              )}\n              {(activeCategory === 'all' || activeCategory === 'airport') && (\n                <Link to=\"/airports\">\n                  <Button variant=\"outline\">Find Airports</Button>\n                </Link>\n              )}\n            </div>\n          )}\n        </div>\n      );\n    }\n\n    return (\n      <Table>\n        <TableHeader>\n          <TableRow>\n            <TableHead>Booking ID</TableHead>\n            <TableHead>\n              {activeCategory === 'all' ? 'Name' : \n               activeCategory === 'event' ? 'Event' : \n               activeCategory === 'university' ? 'University' : 'Airport'}\n            </TableHead>\n            <TableHead className=\"hidden md:table-cell\">Date & Time</TableHead>\n            <TableHead className=\"hidden md:table-cell\">Location</TableHead>\n            <TableHead>Spots</TableHead>\n            <TableHead>Price</TableHead>\n            <TableHead className=\"text-right\">Actions</TableHead>\n          </TableRow>\n        </TableHeader>\n        <TableBody>\n          {items.map((booking) => {\n            // Determine booking name and location based on type\n            let name = \"\";\n            let date = \"\";\n            let time = \"\";\n            let location = \"\";\n            let icon = <Calendar className=\"h-4 w-4 mr-2 text-muted-foreground\" />;\n            \n            if (booking.type === \"event\") {\n              name = booking.eventName;\n              date = booking.eventDate;\n              time = booking.eventTime;\n              location = booking.location;\n            } else if (booking.type === \"university\") {\n              name = booking.universityName;\n              date = booking.bookingDate;\n              time = `${booking.startTime} - ${booking.endTime}`;\n              location = booking.location;\n              icon = <Building className=\"h-4 w-4 mr-2 text-muted-foreground\" />;\n            } else {\n              name = booking.airportName;\n              date = booking.bookingDate;\n              time = `${booking.startTime} - ${booking.endTime}`;\n              location = booking.location;\n              icon = <Plane className=\"h-4 w-4 mr-2 text-muted-foreground\" />;\n            }\n\n            return (\n              <TableRow key={`${booking.type}-${booking.id}`}>\n                <TableCell className=\"font-medium\">{booking.id.substring(0, 8)}</TableCell>\n                <TableCell>\n                  <div>\n                    <p className=\"font-medium line-clamp-1\">{name}</p>\n                    <div className=\"md:hidden text-xs text-muted-foreground mt-1\">\n                      <div className=\"flex items-center\">\n                        <Calendar className=\"h-3 w-3 mr-1\" />\n                        {date}\n                      </div>\n                      <div className=\"flex items-center\">\n                        <Clock className=\"h-3 w-3 mr-1\" />\n                        {time}\n                      </div>\n                    </div>\n                  </div>\n                </TableCell>\n                <TableCell className=\"hidden md:table-cell\">\n                  <div className=\"flex flex-col\">\n                    <div className=\"flex items-center\">\n                      {icon}\n                      {date}\n                    </div>\n                    <div className=\"flex items-center mt-1\">\n                      <Clock className=\"h-4 w-4 mr-2 text-muted-foreground\" />\n                      {time}\n                    </div>\n                  </div>\n                </TableCell>\n                <TableCell className=\"hidden md:table-cell\">\n                  <div className=\"flex items-center\">\n                    <MapPin className=\"h-4 w-4 mr-2 text-muted-foreground\" />\n                    <span className=\"line-clamp-1\">{location}</span>\n                  </div>\n                </TableCell>\n                <TableCell>\n                  {booking.parkingSpots.length > 0 ? \n                    booking.parkingSpots.length > 1 ? \n                      `${booking.parkingSpots.length} spots` : \n                      booking.parkingSpots[0] \n                    : \"No spots\"}\n                </TableCell>\n                <TableCell>₹{booking.totalPrice.toFixed(2)}</TableCell>\n                <TableCell className=\"text-right\">\n                  <div className=\"flex justify-end items-center gap-2\">\n                    {type === \"upcoming\" && (\n                      <>\n                        <Button\n                          variant=\"ghost\"\n                          size=\"icon\"\n                          onClick={() => handleShowQR(booking.id)}\n                          title=\"Show QR Code\"\n                        >\n                          <QrCode className=\"h-4 w-4\" />\n                        </Button>\n                      </>\n                    )}\n                    <Button\n                      variant=\"ghost\"\n                      size=\"icon\"\n                      onClick={() => handleDownloadTicket(booking)}\n                      title=\"Download Ticket\"\n                    >\n                      <Download className=\"h-4 w-4\" />\n                    </Button>\n                    <Link to={`/bookings/${booking.id}`}>\n                      <Button\n                        variant=\"ghost\"\n                        size=\"icon\"\n                        title=\"View Booking Details\"\n                      >\n                        <ExternalLink className=\"h-4 w-4\" />\n                      </Button>\n                    </Link>\n                  </div>\n                </TableCell>\n              </TableRow>\n            );\n          })}\n        </TableBody>\n      </Table>\n    );\n  };\n\n  // Show loading state while checking authentication\n  if (authLoading) {\n    return (\n      <div className=\"min-h-screen flex flex-col\">\n        <Navbar />\n        <main className=\"flex-grow container py-12\">\n          <h1 className=\"text-3xl font-bold mb-8\">My Bookings</h1>\n          <div className=\"space-y-4\">\n            <Skeleton className=\"h-10 w-full\" />\n            <Skeleton className=\"h-64 w-full\" />\n          </div>\n        </main>\n        <Footer />\n      </div>\n    );\n  }\n\n  // Show auth prompt if not logged in\n  if (!user) {\n    return (\n      <div className=\"min-h-screen flex flex-col\">\n        <Navbar />\n        <main className=\"flex-grow container py-12\">\n          <h1 className=\"text-3xl font-bold mb-8\">My Bookings</h1>\n          <AuthPrompt\n            isOpen={true}\n            onClose={() => setShowAuthPrompt(false)}\n            message=\"You need to be logged in to view your bookings.\"\n          />\n        </main>\n        <Footer />\n      </div>\n    );\n  }\n\n  return (\n    <div className=\"min-h-screen flex flex-col\">\n      <Navbar />\n      \n      <main className=\"flex-grow\">\n        <div className=\"container py-12\">\n          <h1 className=\"text-3xl font-bold mb-8\">My Bookings</h1>\n          \n          {isLoading ? (\n            <div className=\"space-y-4\">\n              <Skeleton className=\"h-10 w-full\" />\n              <Skeleton className=\"h-64 w-full\" />\n            </div>\n          ) : (\n            <>\n              <div className=\"flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 mb-6\">\n                <Tabs defaultValue=\"upcoming\" value={activeTab} onValueChange={setActiveTab} className=\"w-full\">\n                  <TabsList>\n                    <TabsTrigger value=\"upcoming\">\n                      Upcoming ({bookingsByType[activeCategory].upcoming.length})\n                    </TabsTrigger>\n                    <TabsTrigger value=\"completed\">\n                      Completed ({bookingsByType[activeCategory].completed.length})\n                    </TabsTrigger>\n                  </TabsList>\n                </Tabs>\n                \n                <Tabs defaultValue=\"all\" value={activeCategory} onValueChange={setActiveCategory} className=\"w-full sm:max-w-md\">\n                  <TabsList>\n                    <TabsTrigger value=\"all\">\n                      All\n                    </TabsTrigger>\n                    <TabsTrigger value=\"event\">\n                      Events\n                    </TabsTrigger>\n                    <TabsTrigger value=\"university\">\n                      Universities\n                    </TabsTrigger>\n                    <TabsTrigger value=\"airport\">\n                      Airports\n                    </TabsTrigger>\n                  </TabsList>\n                </Tabs>\n              </div>\n              \n              <div className=\"border rounded-lg p-4\">\n                <BookingsList \n                  items={filteredBookings}\n                  type={activeTab}\n                />\n              </div>\n            </>\n          )}\n        </div>\n      </main>\n      \n      <Footer />\n\n      {/* QR Code Dialog */}\n      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>\n        <DialogContent className=\"sm:max-w-md\">\n          <DialogHeader>\n            <DialogTitle>Booking QR Code</DialogTitle>\n            <DialogDescription>\n              Present this QR code at the venue entrance for verification.\n            </DialogDescription>\n          </DialogHeader>\n          <div className=\"flex flex-col items-center justify-center p-4\">\n            {selectedQRCode && (\n              <img\n                src={showQRCode(\"\", selectedQRCode)}\n                alt=\"Booking QR Code\"\n                className=\"border rounded-lg p-3 w-full max-w-xs h-auto\"\n              />\n            )}\n          </div>\n          <div className=\"flex justify-between mt-4\">\n            {selectedQRCode && (\n              <a \n                href={showQRCode(\"\", selectedQRCode)} \n                download=\"booking-qrcode.png\"\n                className=\"w-full\"\n              >\n                <Button variant=\"outline\" className=\"w-full\">\n                  <Download className=\"h-4 w-4 mr-2\" />\n                  Save QR Code\n                </Button>\n              </a>\n            )}\n            <DialogClose asChild>\n              <Button className=\"ml-4\">Close</Button>\n            </DialogClose>\n          </div>\n        </DialogContent>\n      </Dialog>\n\n      {/* Auth Prompt Dialog */}\n      {showAuthPrompt && (\n        <AuthPrompt\n          isOpen={true}\n          onClose={() => setShowAuthPrompt(false)}\n          message=\"You need to be logged in to view your bookings.\"\n        />\n      )}\n    </div>\n  );\n};\n\nexport default BookingsPage;
