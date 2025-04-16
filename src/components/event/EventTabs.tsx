
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ParkingLayout from "@/components/ParkingLayout";

interface ParkingSlot {
  id: string;
  state: string;
  row: number;
  column: number;
  price: number;
}

interface EventTabsProps {
  eventId: string;
  parkingTotal: number;
  parkingAvailable: number;
  parkingPrice: number;
  onSlotSelect: (slots: ParkingSlot[]) => void;
}

const EventTabs = ({ 
  eventId, 
  parkingTotal, 
  parkingAvailable, 
  parkingPrice,
  onSlotSelect 
}: EventTabsProps) => {
  return (
    <Tabs defaultValue="parking" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="parking">Parking</TabsTrigger>
        <TabsTrigger value="details">Event Details</TabsTrigger>
        <TabsTrigger value="venue">Venue Info</TabsTrigger>
      </TabsList>
      
      <TabsContent value="parking">
        <ParkingLayout 
          eventId={eventId} 
          totalSlots={parkingTotal}
          availableSlots={parkingAvailable}
          eventPrice={parkingPrice}
          onSlotSelect={onSlotSelect} 
        />
      </TabsContent>
      
      <TabsContent value="details">
        <div className="prose max-w-none">
          <h3>About This Event</h3>
          <p>
            This is an incredible live performance featuring amazing stage production.
          </p>
          
          <h3>Event Schedule</h3>
          <ul>
            <li><strong>Doors Open:</strong> 5:30 PM</li>
            <li><strong>Opening Act:</strong> 7:00 PM</li>
            <li><strong>Main Performance:</strong> 8:15 PM</li>
            <li><strong>Event End (Estimated):</strong> 11:00 PM</li>
          </ul>
          
          <h3>Important Information</h3>
          <p>
            Please arrive early to ensure smooth entry. All attendees must have valid tickets for the event.
            Photography is permitted but professional cameras and recording equipment are prohibited.
          </p>
        </div>
      </TabsContent>
      
      <TabsContent value="venue">
        <div className="prose max-w-none">
          <h3>Venue Information</h3>
          <p>
            This is one of the premier entertainment venues in the country, 
            hosting major concerts, sporting events, and special occasions throughout the year.
          </p>
          
          <h3>Parking Information</h3>
          <p>
            The venue offers several parking lots with varying proximity to the main entrance.
            All parking spots reserved through Time2Park are guaranteed and will be held until the event starts.
          </p>
          
          <h3>Accessibility</h3>
          <p>
            The venue is fully accessible for guests with disabilities. Accessible parking spots are available in all lots.
            Please contact the venue directly for any specific accessibility requirements.
          </p>
          
          <div className="mt-6">
            <img 
              src="https://images.unsplash.com/photo-1522158637959-30ab8018e198?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
              alt="Venue map" 
              className="rounded-lg w-full max-w-xl h-auto"
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default EventTabs;
