import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
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
    { name: 'AI Chatbot', free: '3 sessions/day', researcher: '30 sessions/day' },
    { name: 'AI Peer Review', free: '3 sessions/day', researcher: '15 sessions/day' },
    { name: 'Disease Library', free: '3 searches/day', researcher: '20 searches/day' },
    { name: 'Drug Reference', free: '3 searches/day', researcher: '20 searches/day' },
    { name: 'Clinical Guidelines', free: '3 searches/day', researcher: '20 searches/day' },
    { name: 'Interaction Checker', free: '3 checks/day', researcher: '15 checks/day' },
    { name: 'Explore Gemini', free: '3 questions/day', researcher: '30 questions/day' },
    { name: 'Explore DeepSeek', free: '3 questions/day', researcher: '30 questions/day' },
    { name: 'Medical Calculator', free: 'Unlimited', researcher: 'Unlimited' },
    { name: 'Nutrition Database', free: '3 searches/day', researcher: '20 searches/day' },
    { name: 'Learning Resources', free: 'No Access', researcher: 'Full Access' },
    { name: 'AI Mind Map Generator', free: '2 Mind Maps/day', researcher: '10 Mind Maps/day' },
    { name: 'Clinical Scoring Hub', free: 'Unlimited', researcher: 'Unlimited' },
  ];

  return (
    <> {/* Use Fragment to wrap multiple elements */}
      {/* Original Upgrade Dialog Content - Now wrapped by AlertDialogContent in Layout.tsx */}
      {/* Removed outer AlertDialogContent wrapper, styles moved to Layout.tsx */}
      <> 
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

        {/* Conditionally apply border/rounded only for desktop, make scroll area flexible and explicitly scrollable */}
        <ScrollArea className={`${isMobile ? 'flex-grow overflow-y-auto' : 'h-[300px] border rounded-md flex-grow'} mt-4`}>
          {isMobile ? (
            // Mobile: Render cards directly
            <div className="p-1"> {/* Add slight padding around the cards list */}
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col gap-2 p-3 border rounded-lg mb-2 bg-card"> {/* Added bg-card */}
                  <h4 className="font-medium text-base">{feature.name}</h4>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm w-24 shrink-0">Free:</span>
                      <span className="text-sm">{feature.free}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm w-24 shrink-0">Researcher:</span>
                      <span className="text-sm">{feature.researcher}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop: Render Table
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
                    <TableCell className="font-medium max-w-[200px] whitespace-normal break-words">
                      {feature.name}
                    </TableCell>
                    {/* Apply whitespace-nowrap to prevent wrapping */}
                    <TableCell className="whitespace-nowrap">
                      <span className="break-all">{feature.free}</span>
                    </TableCell>
                    {/* Apply whitespace-nowrap to prevent wrapping */}
                    <TableCell className="whitespace-nowrap">
                      <span className="break-all">{feature.researcher}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>

        <AlertDialogFooter>
          <AlertDialogCancel className={isMobile ? 'w-full' : ''}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleUpgradeClick}
            className={isMobile ? 'w-full' : ''}
          >
            Upgrade Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </> {/* Close the fragment that replaced AlertDialogContent */}

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
