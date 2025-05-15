
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="h-12 w-12 rounded-md overflow-hidden flex items-center justify-center">
                <img 
                  src="/lovable-uploads/0af6a5ad-8987-465d-9d4d-3ce8c79b0650.png" 
                  alt="Time2Park Logo" 
                  className="h-full w-full object-contain"
                  style={{
                    imageRendering: 'high-quality',
                    filter: 'contrast(1.05) brightness(1.05)'
                  }}
                />
              </div>
              <span className="font-bold text-lg text-white">Time2Park</span>
            </Link>
            <p className="text-sm mb-4">
              The easiest way to find and book parking for your next event.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-white transition-colors">Careers</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:text-white transition-colors">Help Center</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Subscribe</h3>
            <p className="text-sm mb-4">
              Get the latest news and updates about new events.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-grow px-3 py-2 text-sm text-gray-800 rounded-l-md focus:outline-none"
              />
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary/90 transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-6 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Time2Park. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
