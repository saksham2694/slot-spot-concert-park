
import { useState } from "react";
import { Link } from "react-router-dom";
import { verifyAndCheckInByQR } from "@/services/vendorService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Scan, CheckCircle2, X } from "lucide-react";

const QRScanner = () => {
  const [qrCode, setQrCode] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode.trim()) return;

    setIsProcessing(true);
    setScanResult(null);

    try {
      const success = await verifyAndCheckInByQR(qrCode);
      
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
    } finally {
      setIsProcessing(false);
    }
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
              Enter the QR code value shown on the customer's booking confirmation.
            </p>
            <p className="mt-2">
              This will verify the booking and mark the customer as arrived.
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default QRScanner;
