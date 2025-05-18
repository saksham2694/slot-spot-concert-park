
import { useState } from "react";
import { Link } from "react-router-dom";
import { QrReader } from "react-qr-reader";
import { verifyAndCheckInByQR } from "@/services/vendorService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Scan, CheckCircle2, X, Camera } from "lucide-react";

const QRScanner = () => {
  const [qrCode, setQrCode] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("manual");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode.trim()) return;

    processQrCode(qrCode);
  };

  const extractBookingId = (qrCodeValue: string): string | null => {
    // Try to match the format TIME2PARK-BOOKING-{uuid}
    const bookingIdMatch = qrCodeValue.match(/TIME2PARK-BOOKING-([0-9a-f-]+)/i);
    
    if (bookingIdMatch && bookingIdMatch[1]) {
      return bookingIdMatch[1]; // Return the UUID part
    }
    
    return qrCodeValue; // Return the original value if no match (fallback)
  };

  const processQrCode = async (code: string) => {
    setIsProcessing(true);
    setScanResult(null);

    try {
      // Extract booking ID from QR code if it matches the expected format
      const bookingId = extractBookingId(code);
      console.log("Extracted booking ID:", bookingId);
      
      const success = await verifyAndCheckInByQR(bookingId);
      
      if (success) {
        setScanResult({
          success: true,
          message: "Check-in successful! Customer has been marked as arrived.",
        });
        setQrCode(""); // Clear the input on success
      } else {
        setScanResult({
          success: false,
          message: "Invalid QR code. No booking found or already checked in.",
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
    }
  };

  const handleScan = (result: any) => {
    if (result && !isProcessing) {
      const scannedData = result?.text;
      if (scannedData) {
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
                scanDelay={500}
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
