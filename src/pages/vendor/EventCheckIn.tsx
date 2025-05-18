
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchEventBookingSlots, markCustomerArrived, type BookingSlot } from "@/services/vendorService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, ArrowLeft, Check, QrCode, Info } from "lucide-react";

const EventCheckIn = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<BookingSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!eventId) return;

    const loadEventBookings = async () => {
      setIsLoading(true);
      try {
        const slots = await fetchEventBookingSlots(eventId);
        setBookingSlots(slots);
        setFilteredSlots(slots);
      } catch (error) {
        console.error("Error loading event bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEventBookings();
  }, [eventId]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSlots(bookingSlots);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = bookingSlots.filter(
      (slot) =>
        slot.slotId.toLowerCase().includes(query) ||
        (slot.customerName?.toLowerCase() || "").includes(query) ||
        (slot.customerEmail?.toLowerCase() || "").includes(query)
    );
    setFilteredSlots(filtered);
  }, [searchQuery, bookingSlots]);

  const handleMarkArrived = async (bookingSlotId: string) => {
    setIsProcessing((prev) => ({ ...prev, [bookingSlotId]: true }));
    
    try {
      const success = await markCustomerArrived(bookingSlotId);
      
      if (success) {
        // Update the local state to reflect the change
        setBookingSlots(
          bookingSlots.map((slot) =>
            slot.id === bookingSlotId ? { ...slot, customerArrived: true } : slot
          )
        );
        // Also update filtered slots if necessary
        setFilteredSlots(
          filteredSlots.map((slot) =>
            slot.id === bookingSlotId ? { ...slot, customerArrived: true } : slot
          )
        );
      }
    } finally {
      setIsProcessing((prev) => ({ ...prev, [bookingSlotId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link to="/vendor">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-semibold">Event Check-ins</h2>
      </div>

      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by slot ID, customer name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link to="/vendor/scan-qr">
          <Button className="whitespace-nowrap">
            <QrCode className="mr-2 h-4 w-4" />
            Scan QR Code
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Slot ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSlots.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  {searchQuery
                    ? "No bookings match your search"
                    : "No bookings found for this event"}
                </TableCell>
              </TableRow>
            ) : (
              filteredSlots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell>{slot.slotId}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{slot.customerName || "Unknown"}</span>
                      {slot.customerEmail && (
                        <span className="text-xs text-muted-foreground">
                          {slot.customerEmail}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {slot.customerArrived ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 hover:bg-green-500/10 hover:text-green-600">
                        Arrived
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/10 hover:text-amber-600">
                        Expected
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={slot.customerArrived || isProcessing[slot.id]}
                              onClick={() => handleMarkArrived(slot.id)}
                              className="h-8 px-2"
                            >
                              {isProcessing[slot.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : slot.customerArrived ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Check className="h-4 w-4" /> Mark Arrived
                                </span>
                              )}
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {slot.customerArrived && (
                          <TooltipContent side="left">
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4" />
                              <span>Customer already checked in</span>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        {filteredSlots.length > 0 && (
          <p>
            {filteredSlots.filter((s) => s.customerArrived).length} of{" "}
            {filteredSlots.length} customers have arrived
          </p>
        )}
      </div>
    </div>
  );
};

export default EventCheckIn;
