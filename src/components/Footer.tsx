import { useIsMobile } from "@/hooks/use-mobile";

const Footer = () => {
  const isMobile = useIsMobile();

  return (
    <footer className="bg-background border-t py-8 mt-auto">
      <div className="container flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <div className="h-10 w-10 rounded-md overflow-hidden flex items-center justify-center">
            <img 
              src="/lovable-uploads/0af6a5ad-8987-465d-9d4d-3ce8c79b0650.png" 
              alt="Time2Park Logo" 
              className="h-full w-full object-contain"
              style={{
                imageRendering: "crisp-edges",
                filter: "contrast(1.05) brightness(1.05)"
              }}
            />
          </div>
          <span className="font-medium text-foreground">Time2Park</span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
          <a href="/terms" className="hover:underline">Terms of Service</a>
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <span>© {new Date().getFullYear()} Time2Park. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
