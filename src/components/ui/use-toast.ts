
// Re-export from the hooks directory to maintain compatibility
// with existing imports throughout the application
import { useToast as useToastHook, toast as toastFunction } from "@/hooks/use-toast";

export const useToast = useToastHook;
export const toast = toastFunction;
