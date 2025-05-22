
import React from "react";
import { useEffect, useState } from "react";
import { fetchBookingsForUser } from "@/services/bookingService";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Booking } from "@/types/booking";
import { Calendar, Clock, MapPin, Tag, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BookingsPage = () => {
  const { user, isLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      if (user) {
        setLoading(true);
        try {
          const userBookings = await fetchBookingsForUser(user.id);
          setBookings(userBookings);
        } catch (error) {
          console.error("Failed to load bookings:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadBookings();
  }, [user]);

  if (isLoading) {
    return <div className="text-center py-10">Loading user data...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        Please <Link to="/login">login</Link> to view your bookings.
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-10">Loading bookings...</div>;
  }

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 'pending':
      case 'pending_payment':
      case 'payment_pending':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case 'cancelled':
      case 'payment_failed':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const formatParkingSpots = (booking: Booking) => {
    if (booking.parking_spots && booking.parking_spots.length > 0) {
      return booking.parking_spots.join(', ');
    }
    
    if (booking.booking_slots && booking.booking_slots.length > 0) {
      return booking.booking_slots.map(slot => 
        `R${slot.parking_layouts.row_number}C${slot.parking_layouts.column_number}`
      ).join(', ');
    }
    
    return 'N/A';
  };

  // Filter bookings by type
  const eventBookings = bookings.filter(booking => booking.event_id);
  const universityBookings = bookings.filter(booking => booking.university_id);
  const airportBookings = bookings.filter(booking => booking.airport_id);

  return (
    <div className="container py-8">
      <h2 className="text-2xl font-semibold mb-6">My Bookings</h2>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="universities">Universities</TabsTrigger>
          <TabsTrigger value="airports">Airports</TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events">
          {eventBookings.length === 0 ? (
            <div className="text-center py-8 bg-muted rounded-lg">
              <p className="text-lg text-muted-foreground">
                No event bookings found. Explore our{" "}
                <Link to="/events" className="text-primary hover:underline">
                  events
                </Link>{" "}
                and book your parking spot today!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="bg-muted/50 pb-2">
                    <CardTitle className="text-lg">
                      {booking.events?.title || "Event Booking"}
                    </CardTitle>
                    <CardDescription>
                      {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : "N/A"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                      <span>
                        {booking.eventDate || booking.start_date 
                          ? new Date(booking.eventDate || booking.start_date).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    
                    {booking.eventTime || (booking.start_date && booking.end_date) ? (
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                        <span>
                          {booking.eventTime || (
                            <>
                              {new Date(booking.start_date).toLocaleTimeString([], { 
                                hour: "2-digit", 
                                minute: "2-digit" 
                              })} 
                              {" - "}
                              {new Date(booking.end_date).toLocaleTimeString([], { 
                                hour: "2-digit", 
                                minute: "2-digit" 
                              })}
                            </>
                          )}
                        </span>
                      </div>
                    ) : null}
                    
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <span>
                        {booking.events?.location || "Unknown Location"}
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Tag className="h-4 w-4 mt-1 text-muted-foreground" />
                      <span>
                        <span className="font-medium">Parking Spots:</span> {formatParkingSpots(booking)}
                      </span>
                    </div>
                    
                    {booking.payment_amount && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                        <span>
                          <span className="font-medium">Amount:</span> ${booking.payment_amount}
                        </span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex items-center justify-between pt-2 border-t">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/bookings/${booking.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Universities Tab */}
        <TabsContent value="universities">
          {universityBookings.length === 0 ? (
            <div className="text-center py-8 bg-muted rounded-lg">
              <p className="text-lg text-muted-foreground">
                No university bookings found. Explore our{" "}
                <Link to="/universities" className="text-primary hover:underline">
                  universities
                </Link>{" "}
                and book your parking spot today!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {universityBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="bg-muted/50 pb-2">
                    <CardTitle className="text-lg">
                      {booking.university?.name || "University Booking"}
                    </CardTitle>
                    <CardDescription>
                      {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : "N/A"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                      <span>
                        {booking.start_date 
                          ? new Date(booking.start_date).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    
                    {(booking.start_date && booking.end_date) ? (
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                        <span>
                          {new Date(booking.start_date).toLocaleTimeString([], { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })} 
                          {" - "}
                          {new Date(booking.end_date).toLocaleTimeString([], { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </span>
                      </div>
                    ) : null}
                    
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <span>
                        {booking.university?.location || "Unknown Location"}
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Tag className="h-4 w-4 mt-1 text-muted-foreground" />
                      <span>
                        <span className="font-medium">Parking Spots:</span> {formatParkingSpots(booking)}
                      </span>
                    </div>
                    
                    {booking.payment_amount && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                        <span>
                          <span className="font-medium">Amount:</span> ${booking.payment_amount}
                        </span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex items-center justify-between pt-2 border-t">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/bookings/${booking.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Airports Tab */}
        <TabsContent value="airports">
          {airportBookings.length === 0 ? (
            <div className="text-center py-8 bg-muted rounded-lg">
              <p className="text-lg text-muted-foreground">
                No airport bookings found. Explore our{" "}
                <Link to="/airports" className="text-primary hover:underline">
                  airports
                </Link>{" "}
                and book your parking spot today!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {airportBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="bg-muted/50 pb-2">
                    <CardTitle className="text-lg">
                      {booking.airport?.name || "Airport Booking"}
                    </CardTitle>
                    <CardDescription>
                      {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : "N/A"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                      <span>
                        {booking.start_date 
                          ? new Date(booking.start_date).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    
                    {(booking.start_date && booking.end_date) ? (
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                        <span>
                          {new Date(booking.start_date).toLocaleTimeString([], { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })} 
                          {" - "}
                          {new Date(booking.end_date).toLocaleTimeString([], { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </span>
                      </div>
                    ) : null}
                    
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <span>
                        {booking.airport?.location || "Unknown Location"}
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Tag className="h-4 w-4 mt-1 text-muted-foreground" />
                      <span>
                        <span className="font-medium">Parking Spots:</span> {formatParkingSpots(booking)}
                      </span>
                    </div>
                    
                    {booking.payment_amount && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                        <span>
                          <span className="font-medium">Amount:</span> ${booking.payment_amount}
                        </span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex items-center justify-between pt-2 border-t">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/bookings/${booking.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingsPage;
