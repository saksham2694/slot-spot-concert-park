// VendorCheckIn.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const UniversityCheckIn = () => {
  const { universityId } = useParams<{ universityId: string }>();
  const [bookingId, setBookingId] = useState<string>("");
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: universityName, isLoading: loadingName } = useQuery({
    queryKey: ["universityName", universityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("universities")
        .select("name")
        .eq("id", universityId)
        .single();
    
      if (error) throw error;
      return data;
    },
    meta: {
      onSuccess: (data) => {
        // Any success handlers here
        console.log("University name loaded:", data.name);
      }
    },
    // Any other query options
  });

  const handleCheckIn = async () => {
    setError(null);
    try {
      // Fetch booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from("university_bookings")
        .select("*")
        .eq("id", bookingId)
        .eq("university_id", universityId)
        .single();

      if (bookingError) {
        setError("Booking not found or invalid booking ID.");
        setBookingDetails(null);
        return;
      }

      if (!bookingData) {
        setError("Booking not found.");
        setBookingDetails(null);
        return;
      }

      // Check if booking is already checked in (status == "completed")
      if (bookingData.status === "completed") {
        setError("Booking is already checked in.");
        setBookingDetails(null);
        return;
      }

      // Update booking status to "completed"
      const { error: updateError } = await supabase
        .from("university_bookings")
        .update({ status: "completed" })
        .eq("id", bookingId);

      if (updateError) {
        setError("Failed to update booking status.");
        setBookingDetails(null);
        return;
      }

      setBookingDetails(bookingData);
      toast({
        title: "Check-In Successful",
        description: "The booking has been successfully checked in.",
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setBookingDetails(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>University Check-In</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {universityName ? (
            <p className="text-lg font-semibold">
              Welcome to {universityName?.name}!
            </p>
          ) : (
            <p>Loading University Name...</p>
          )}
          <div className="grid gap-2">
            <Label htmlFor="bookingId">Booking ID</Label>
            <Input
              type="text"
              id="bookingId"
              placeholder="Enter Booking ID"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            />
          </div>
          <Button onClick={handleCheckIn}>Check In</Button>
          {error && <p className="text-red-500">{error}</p>}
          {bookingDetails && (
            <div className="mt-4 p-4 border rounded-md bg-green-100 text-green-800">
              <p>Booking ID: {bookingDetails.id.substring(0, 8)}</p>
              <p>Status: Checked In <Check className="inline-block h-4 w-4 ml-1" /></p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UniversityCheckIn;
