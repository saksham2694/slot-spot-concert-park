
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title?: string;
}

// Main component with isOpen prop
export function ErrorDialog({ isOpen, onClose, message, title = "Error" }: ErrorDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Alternative version with open prop for compatibility with components using open instead of isOpen
export function ErrorDialogAlt({ open, onOpenChange, message, title = "Error" }: { 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  title?: string;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
