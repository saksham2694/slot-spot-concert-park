
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Event } from "@/types/event";
import { ParkingSlot } from "@/types/parking";

// Add the missing type to jsPDF
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export async function generateBookingPDF(
  event: Event,
  selectedSlots: ParkingSlot[],
  bookingId: string,
  qrCodeData: string
): Promise<Blob> {
  // Create a new PDF document
  const doc = new jsPDF();
  const totalPrice = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(0, 128, 0);
  doc.text("TIME2PARK - Booking Confirmation", 105, 20, { align: "center" });
  
  // Add event info
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Event: ${event.title}`, 20, 40);
  doc.text(`Date: ${event.date}`, 20, 50);
  doc.text(`Time: ${event.time}`, 20, 60);
  doc.text(`Location: ${event.location}`, 20, 70);
  
  // Add booking info
  doc.setFontSize(12);
  doc.text(`Booking ID: ${bookingId || "Temporary ID"}`, 20, 90);
  doc.text(`Parking Spot${selectedSlots.length > 1 ? "s" : ""}: ${selectedSlots.map(s => s.id).join(", ")}`, 20, 100);
  doc.text(`Amount Paid: ₹${totalPrice.toFixed(2)}`, 20, 110);
  
  // Add QR code image if available
  try {
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeData)}`;
    const qrImage = await fetchImageAsDataURL(qrImageUrl);
    
    if (qrImage) {
      doc.addImage(qrImage, "PNG", 130, 40, 60, 60);
      doc.text("Scan QR code at entrance", 160, 110, { align: "center" });
    }
  } catch (error) {
    console.error("Failed to add QR code to PDF:", error);
  }
  
  // Add terms and guidelines
  doc.setFontSize(10);
  doc.text("Important Information:", 20, 130);
  
  const guidelines = [
    "1. Please arrive at least 30 minutes before the event starts.",
    "2. Have this confirmation ready for scanning at the entrance.",
    "3. Parking spots are non-refundable after purchase.",
    "4. For assistance, contact support@time2park.com"
  ];
  
  let yPos = 140;
  guidelines.forEach(line => {
    doc.text(line, 20, yPos);
    yPos += 10;
  });
  
  // Add footer
  doc.setFontSize(8);
  doc.text("TIME2PARK - Your Parking Solution", 105, 280, { align: "center" });
  doc.text("This is an electronically generated document and does not require a signature.", 105, 285, { align: "center" });
  
  // Return the PDF as a blob
  return doc.output("blob");
}

// Helper function to fetch an image and convert it to data URL
async function fetchImageAsDataURL(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    throw error;
  }
}

// Function to create and download a PDF from booking data
export function downloadBookingPDF(
  event: Event,
  selectedSlots: ParkingSlot[],
  bookingId: string,
  qrCodeData: string
): Promise<void> {
  return generateBookingPDF(event, selectedSlots, bookingId, qrCodeData)
    .then(blob => {
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create an anchor element and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `TIME2PARK-${event.title.replace(/\s+/g, "-")}-${bookingId || "ticket"}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    });
}

// Function to show the QR code in a downloadable format
export function showQRCode(bookingId: string, qrCodeData: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeData)}`;
}
