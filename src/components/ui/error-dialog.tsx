
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ErrorDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  message: string;
  title?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Combined component that supports both isOpen/onClose and open/onOpenChange patterns
export function ErrorDialog({ 
  isOpen, 
  onClose, 
  message, 
  title = "Error",
  open,
  onOpenChange 
}: ErrorDialogProps) {
  // Determine which props to use based on what was provided
  const isDialogOpen = isOpen !== undefined ? isOpen : open;
  const handleOpenChange = onOpenChange || (onClose ? (isOpen: boolean) => {
    if (!isOpen) onClose();
  } : undefined);

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
