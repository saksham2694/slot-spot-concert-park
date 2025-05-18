
import { useState } from "react";
import { Link } from "react-router-dom";
import { QrReader } from "react-qr-reader";
import { verifyAndCheckInByQR } from "@/services/vendorService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Scan, CheckCircle2, X, Camera, AlertCircle } from "lucide-react";

const QRScanner = () => {
  const [qrCode, setQrCode] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("manual");
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [scanDelay, setScanDelay] = useState<number>(500);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode.trim()) return;

    processQrCode(qrCode);
  };

  const extractBookingId = (qrCodeValue: string): string => {
    // Try to match the format TIME2PARK-BOOKING-{uuid}
    const bookingIdMatch = qrCodeValue.match(/TIME2PARK-BOOKING-([0-9a-f-]+)/i);
    
    if (bookingIdMatch && bookingIdMatch[1]) {
      console.log("Extracted booking ID from format:", bookingIdMatch[1]);
      return bookingIdMatch[1]; // Return the UUID part
    }
    
    // If no match, return the original value as a fallback
    console.log("No match found, using original value:", qrCodeValue);
    return qrCodeValue;
  };

  const processQrCode = async (code: string) => {
    // Prevent processing if already handling a code
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    setScanResult(null);
    setLastScannedCode(code);
    
    try {
      // Temporarily increase scan delay to avoid multiple scans
      setScanDelay(2000);

      // Extract booking ID from QR code if it matches the expected format
      const bookingId = extractBookingId(code);
      console.log("Extracted booking ID:", bookingId);
      
      // Check if the booking ID looks like a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(bookingId)) {
        setScanResult({
          success: false,
          message: "Invalid QR code format. Expected a valid booking ID.",
        });
        setIsProcessing(false);
        return;
      }
      
      const success = await verifyAndCheckInByQR(bookingId);
      
      if (success) {
        setScanResult({
          success: true,
          message: "Check-in successful! Customer has been marked as arrived.",
        });
        setQrCode(""); // Clear the input on success
      } else {
        // Error message will be displayed via toast from the service
        setScanResult({
          success: false,
          message: "Check-in failed. Please verify the booking status.",
        });
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      setScanResult({
        success: false,
        message: "Error processing QR code. Please try again.",
      });
    } finally {
      setIsProcessing(false);
      // Reset scan delay after processing completes
      setTimeout(() => {
        setScanDelay(500);
      }, 2000);
    }
  };

  const handleScan = (result: any) => {
    if (result && !isProcessing) {
      const scannedData = result?.text;
      if (scannedData && scannedData !== lastScannedCode) {
        console.log("Scanned QR code value:", scannedData);
        setQrCode(scannedData);
        processQrCode(scannedData);
      }
    }
  };

  const handleScanError = (error: any) => {
    console.error("QR scan error:", error);
    setScanResult({
      success: false,
      message: "Error scanning QR code. Please try again or use manual entry.",
    });
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/vendor">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-semibold">QR Code Scanner</h2>
      </div>
      
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="camera">Camera Scan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Enter QR code value"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  className="flex-1"
                  disabled={isProcessing}
                />
                <Button type="submit" disabled={!qrCode.trim() || isProcessing}>
                  {isProcessing ? (
                    <span className="flex items-center">
                      <Scan className="mr-2 h-4 w-4 animate-pulse" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Scan className="mr-2 h-4 w-4" />
                      Verify
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="camera" className="space-y-4">
            <div className="rounded border overflow-hidden">
              <QrReader
                constraints={{ facingMode: 'environment' }}
                onResult={handleScan}
                scanDelay={scanDelay}
                className="w-full"
                videoStyle={{ objectFit: 'cover', width: '100%' }}
                videoContainerStyle={{ width: '100%', height: 'auto', minHeight: '250px', maxHeight: '300px' }}
              />
            </div>
            <div className="text-center text-sm text-muted-foreground mt-2">
              <p>Point your camera at a customer's QR code</p>
              {isProcessing && <p className="mt-2 font-medium text-primary">Processing scan...</p>}
            </div>
          </TabsContent>
        </Tabs>

        {scanResult && (
          <div
            className={`p-4 rounded-md mt-4 ${
              scanResult.success
                ? "bg-green-500/10 text-green-700"
                : "bg-red-500/10 text-red-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {scanResult.success ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
              <p>{scanResult.message}</p>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground mt-4">
          <p className="flex items-center gap-1.5 mb-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <strong>Important:</strong> Make sure the booking is in "confirmed" status.
          </p>
          <p>
            Verify customer bookings by scanning their QR code or entering the code value.
          </p>
          <p className="mt-2">
            The QR code contains a unique identifier that links to their booking.
          </p>
          <p className="mt-2 text-xs">
            Format: TIME2PARK-BOOKING-[booking-id]
          </p>
        </div>
      </Card>
    </div>
  );
};

export default QRScanner;
