
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedEvents from "@/components/FeaturedEvents";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Car, Clock, CreditCard, MapPin, Shield, Star, Building, Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        
        <FeaturedEvents />
        
        {/* Parking Options Section */}
        <section className="py-16 bg-muted">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Parking Solutions</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find and book parking spots for various locations based on your needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Event Parking</h3>
                <p className="text-muted-foreground mb-4">
                  Secure your parking spot for concerts, games, and special events
                </p>
                <Button onClick={() => navigate("/events")} variant="outline" className="mt-2">
                  Browse Events
                </Button>
              </div>
              
              <div className="bg-card p-6 rounded-lg text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">University Parking</h3>
                <p className="text-muted-foreground mb-4">
                  Book campus parking spots for students, faculty, and visitors
                </p>
                <Button onClick={() => navigate("/universities")} variant="outline" className="mt-2">
                  Find Universities
                </Button>
              </div>
              
              <div className="bg-card p-6 rounded-lg text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plane className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Airport Parking</h3>
                <p className="text-muted-foreground mb-4">
                  Reserve long-term or short-term parking at major airports
                </p>
                <Button onClick={() => navigate("/airports")} variant="outline" className="mt-2">
                  Find Airports
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find and book parking spots in just a few simple steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Find Your Location</h3>
                <p className="text-muted-foreground">
                  Browse events, universities, or airports to find your desired parking location
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Select Your Spot</h3>
                <p className="text-muted-foreground">
                  Choose from available parking spots on our interactive parking layout
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Book & Go</h3>
                <p className="text-muted-foreground">
                  Pay securely and receive a QR code for easy access on arrival
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why Choose Time2Park Section */}
        <section className="py-16 bg-muted">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Why Choose Time2Park?</h2>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg h-fit">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">Guaranteed Spot</h3>
                      <p className="text-muted-foreground">
                        Your parking space is reserved just for you, so you'll never have to worry about finding parking again
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg h-fit">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">Save Time</h3>
                      <p className="text-muted-foreground">
                        Skip the hassle of circling venues looking for parking. Head straight to your reserved spot
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg h-fit">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">Simple Payment</h3>
                      <p className="text-muted-foreground">
                        Pay in advance with our secure payment system. No need for cash or payment machines on site
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="mt-8 border-parking-primary text-parking-primary hover:bg-parking-primary/10" onClick={() => navigate("/about")}>
                  Learn More About Us
                </Button>
              </div>
              
              <div className="relative">
                <div className="relative rounded-lg overflow-hidden shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1562426509-5044a121aa49" 
                    alt="Concert parking" 
                    className="w-full h-auto object-cover aspect-[4/3]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 text-white">
                    <p className="text-lg font-medium">Never miss a moment of your event</p>
                    <p>Hassle-free parking for a stress-free experience</p>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/20 rounded-full -z-10"></div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-gradient-to-r from-parking-primary to-parking-secondary text-white">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Spot?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of customers who park stress-free with Time2Park
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" className="bg-white text-parking-primary hover:bg-gray-100" onClick={() => navigate("/events")}>
                Browse Events
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => navigate("/universities")}>
                Find University Parking
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => navigate("/airports")}>
                Find Airport Parking
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
