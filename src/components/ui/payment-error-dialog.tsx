
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface PaymentErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  onRetry?: () => void;
}

const PaymentErrorDialog: React.FC<PaymentErrorDialogProps> = ({ 
  isOpen, 
  onClose, 
  message,
  onRetry 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Payment Error
          </DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {onRetry && (
            <Button onClick={onRetry} variant="default">
              Try Again
            </Button>
          )}
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentErrorDialog;
