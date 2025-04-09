import React, { useState } from 'react'; // Import useState
import {
  AlertDialog, // Keep AlertDialog imports for the main dialog structure
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
// Removed: import { useAuth } from '@/contexts/AuthContext';
// Removed: import { useToast } from "@/hooks/use-toast"; // No longer using toast
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // Import Dialog components
import { Button } from "@/components/ui/button"; // Import Button

// This component now expects to be rendered inside an <AlertDialog>
const UpgradePlanDialogContent = () => {
  // Removed: const { upgradeToResearcher } = useAuth();
  // Removed: const { toast } = useToast();
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false); // State for confirmation dialog

  const paymentUrl = "http://lynk.id/daivan/z9gl74zn9y5o/checkout"; // Define payment URL

  const handleUpgradeClick = () => {
    // Open payment link in a new tab
    window.open(paymentUrl, '_blank');

    // Show confirmation dialog instead of toast
    setShowConfirmationDialog(true);
  };

  // Split features into two groups
  const features = [
    { name: 'AI Chatbot', free: '3 questions/day', researcher: '30 questions/day' },
    { name: 'AI Peer Review', free: '3 reviews/day', researcher: '15 reviews/day' },
    { name: 'Disease Library', free: '3 searches/day', researcher: '20 searches/day' },
    { name: 'Drug Reference', free: '3 searches/day', researcher: '20 searches/day' },
    { name: 'Clinical Guidelines', free: '3 searches/day', researcher: '20 searches/day' },
    { name: 'Interaction Checker', free: '3 checks/day', researcher: '15 checks/day' },
    { name: 'Explore Gemini', free: '3 questions/day', researcher: '30 questions/day' },
    { name: 'Medical Calculator', free: 'Unlimited', researcher: 'Unlimited' },
    { name: 'Nutrition Database', free: '3 searches/day', researcher: '20 searches/day' },
    { name: 'Learning Resources', free: 'No Access', researcher: 'Full Access' },
    { name: 'AI Mind Map Generator', free: '2 Mind Maps/day', researcher: '10 Mind Maps/day' },
    { name: 'Clinical Scoring Hub', free: 'Unlimited', researcher: 'Unlimited' },
  ];

  return (
    <> {/* Use Fragment to wrap multiple elements */}
      {/* Original Upgrade Dialog Content */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Upgrade to Researcher Plan</AlertDialogTitle>
          <AlertDialogDescription>
            Unlock advanced features and higher quotas with the Researcher plan.
            <br /> {/* Add a line break for spacing */}
            If you encounter any issues or have questions after payment, please contact{' '}
            <a
              href="https://wa.me/6285326958791"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline" // Added basic styling
            >
              Customer Service via WhatsApp
            </a>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ScrollArea className="h-[300px] mt-4 border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Free Level</TableHead>
                <TableHead>Researcher Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((feature) => (
                <TableRow key={feature.name}>
                  <TableCell>{feature.name}</TableCell>
                  <TableCell>{feature.free}</TableCell>
                  <TableCell>{feature.researcher}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {/* Update onClick handler */}
          <AlertDialogAction onClick={handleUpgradeClick}>Upgrade Now</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Link Opened</DialogTitle>
            <DialogDescription className="text-justify"> {/* Add text-justify class */}
              Your account will be upgraded to Researcher within 1x24 hours after payment confirmation.
              Please contact Customer Service if the upgrade hasn't occurred by then.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">OK</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpgradePlanDialogContent;
