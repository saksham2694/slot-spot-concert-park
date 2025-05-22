import React from "react";
import { useEffect, useState } from "react";
import { fetchBookingsForUser } from "@/services/bookingService";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Booking } from "@/types/booking";
import { Calendar, Clock, MapPin } from "lucide-react";

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

  const eventMockData = [
    {
      id: "1",
      title: "Concert at Stadium",
      date: "May 15, 2025",
      time: "8:00 PM",
      location: "Main City Stadium",
      image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
      availableParkingSlots: 120,
      totalParkingSlots: 200,
      parkingPrice: 20,
    },
    {
      id: "2",
      title: "Football Match",
      date: "June 5, 2025",
      time: "4:00 PM",
      location: "Sports Arena",
      image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
      availableParkingSlots: 80,
      totalParkingSlots: 150,
      parkingPrice: 15,
    },
    {
      id: "3",
      title: "Music Festival",
      date: "July 10, 2025",
      time: "2:00 PM",
      location: "Central Park",
      image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
      availableParkingSlots: 200,
      totalParkingSlots: 300,
      parkingPrice: 25,
    },
  ];

  return (
    <div className="container py-8">
      <h2 className="text-2xl font-semibold mb-6">My Bookings</h2>

      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">
            No bookings found. Explore our{" "}
            <Link to="/events" className="text-parking-primary hover:underline">
              events
            </Link>{" "}
            and book your parking spot today!
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking Details</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  {booking.events ? (
                    <>
                      <p className="text-lg font-medium">
                        {booking.events?.title || "Unknown Event"}
                      </p>
                      <p>
                        <Calendar className="h-4 w-4 mr-2 inline-block" />
                        {booking.eventDate || "Unknown Date"}
                      </p>
                      <p>
                        <Clock className="h-4 w-4 mr-2 inline-block" />
                        {booking.eventTime || ""}
                      </p>
                      <p>
                        <MapPin className="h-4 w-4 mr-2 inline-block" />
                        {booking.location || "Unknown Location"}
                      </p>
                    </>
                  ) : booking.university ? (
                    <>
                      <p className="text-lg font-medium">
                        {booking.university?.name || "Unknown University"}
                      </p>
                      <p>
                        {new Date(booking.start_date || "").toLocaleDateString()}
                      </p>
                      <p>
                        {booking.start_date
                          ? new Date(booking.start_date).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : ""}{" "}
                        -{" "}
                        {booking.end_date
                          ? new Date(booking.end_date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </>
                  ) : booking.airport ? (
                    <>
                      <p className="text-lg font-medium">
                        {booking.airport?.name || "Unknown Airport"}
                      </p>
                      <p>
                        {new Date(booking.start_date || "").toLocaleDateString()}
                      </p>
                      <p>
                        {booking.start_date
                          ? new Date(booking.start_date).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : ""}{" "}
                        -{" "}
                        {booking.end_date
                          ? new Date(booking.end_date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </>
                  ) : (
                    <p>Unknown Booking Type</p>
                  )}
                </TableCell>
                <TableCell>
                  {booking.booking_date
                    ? new Date(booking.booking_date).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {booking.events?.location ||
                    booking.university?.location ||
                    booking.airport?.location ||
                    "N/A"}
                </TableCell>
                <TableCell className="text-right">{booking.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default BookingsPage;
