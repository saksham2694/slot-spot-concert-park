
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Info, Users, Calendar, MapPin, Car, HeartHandshake } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Separator } from "@/components/ui/separator";

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-primary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">About Time2Park</h1>
              <p className="text-xl text-muted-foreground mb-6">
                We're making event parking simple, efficient and stress-free.
              </p>
            </div>
          </div>
        </section>

        {/* Mission section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg mb-4">
                  Time2Park was founded with a simple but powerful mission: to eliminate the stress and uncertainty
                  of finding parking at events.
                </p>
                <p className="text-lg mb-6">
                  We believe that attending events should be about the experience, not about circling blocks
                  looking for parking or paying exorbitant fees at the last minute.
                </p>
                <Button asChild size="lg">
                  <Link to="/events">Browse Events</Link>
                </Button>
              </div>
              <div className="bg-muted rounded-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-primary/20 p-3 rounded-full mr-4">
                    <HeartHandshake className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Our Values</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex">
                    <span className="font-medium mr-2">•</span>
                    <span>Simplicity in every interaction</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium mr-2">•</span>
                    <span>Transparency in pricing and availability</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium mr-2">•</span>
                    <span>Customer satisfaction above all</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium mr-2">•</span>
                    <span>Innovation in parking solutions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* How it works */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How Time2Park Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform simplifies the entire parking reservation process in just a few steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background p-6 rounded-lg shadow-sm">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Find Your Event</h3>
                <p className="text-muted-foreground">
                  Browse upcoming events in your area and select the one you're planning to attend.
                </p>
              </div>

              <div className="bg-background p-6 rounded-lg shadow-sm">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. Reserve Your Spot</h3>
                <p className="text-muted-foreground">
                  Select from available parking spots near the venue and secure it with an instant booking.
                </p>
              </div>

              <div className="bg-background p-6 rounded-lg shadow-sm">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Park With Ease</h3>
                <p className="text-muted-foreground">
                  On event day, follow the directions to your reserved spot and enjoy the event without parking stress.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Founders</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Meet the passionate entrepreneurs behind Time2Park working to revolutionize event parking.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold">Daksh</h3>
                <p className="text-muted-foreground">Co-Founder</p>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold">Arjun</h3>
                <p className="text-muted-foreground">Co-Founder</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="bg-primary py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-6">Ready to experience stress-free parking?</h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join thousands of event-goers who have simplified their parking experience with Time2Park.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/events">Find an Event</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
