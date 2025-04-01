import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X as XIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Define plan types
type Plan = 'Premium' | 'Researcher';

// Feature comparison data
const featureData = [
  { feature: 'AI Chatbot', free: '10 queries/day', premium: '30 queries/day', researcher: 'Unlimited' },
  { feature: 'AI Peer Review', free: '5 reviews/day', premium: '15 reviews/day', researcher: 'Unlimited' },
  { feature: 'Disease Library', free: '10 searches/day', premium: '20 searches/day', researcher: 'Unlimited' },
  { feature: 'Drug Reference', free: '10 searches/day', premium: '20 searches/day', researcher: 'Unlimited' },
  { feature: 'Clinical Guidelines', free: '5 searches/day', premium: '50 searches/day', researcher: 'Unlimited' },
  { feature: 'Interaction Checker', free: '5 checks/day', premium: '15 checks/day', researcher: 'Unlimited' },
  { feature: 'Explore Gemini', free: '5 queries/day', premium: '20 queries/day', researcher: '50 queries/day' },
  { feature: 'Medical Calculator', free: 'Unlimited', premium: 'Unlimited', researcher: 'Unlimited' },
  { feature: 'Nutrition Database', free: '10 searches/day', premium: '20 searches/day', researcher: 'Unlimited' },
  { feature: 'Learning Resources', free: 'No Access', premium: 'No Access', researcher: 'Full Access' },
  { feature: 'Medical News', free: 'Unlimited', premium: 'Unlimited', researcher: 'Unlimited' },
];

// Declare Midtrans Snap type on window
declare global {
  interface Window {
    snap: {
      pay: (token: string, options?: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

interface UpgradePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Export the component correctly
export function UpgradePlanDialog({ open, onOpenChange }: UpgradePlanDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('Premium');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Effect to ensure Snap.js script is loaded
  useEffect(() => {
    const snapScriptId = 'midtrans-snap-script';
    // Ensure VITE_MIDTRANS_CLIENT_KEY is accessed correctly
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    // Determine Snap URL based on environment (using VITE_ environment variable is common)
    const snapUrl = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    if (!document.getElementById(snapScriptId) && clientKey) {
      const script = document.createElement('script');
      script.id = snapScriptId;
      script.src = snapUrl;
      script.setAttribute('data-client-key', clientKey);
      script.async = true;
      document.body.appendChild(script);
      console.log('Midtrans Snap.js script added.');

      return () => {
        const existingScript = document.getElementById(snapScriptId);
        if (existingScript) {
          document.body.removeChild(existingScript);
          console.log('Midtrans Snap.js script removed.');
        }
      };
    } else if (!clientKey) {
        console.warn('VITE_MIDTRANS_CLIENT_KEY is not set. Midtrans Snap will not load.');
    }
  }, []);


  // Function to initiate Midtrans Payment
  const initiateMidtransPayment = async (userId: string, userEmail: string, plan: Plan) => {
    setIsProcessing(true);
    try {
      // --- Actual Implementation ---
      // 1. Call backend function to get transaction token
      const response = await fetch('/.netlify/functions/create-midtrans-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userEmail, plan }),
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        throw new Error(data.error || 'Failed to create payment transaction.');
      }

      const transactionToken = data.token;

      // 2. Use Midtrans Snap.js to open the payment popup
      if (window.snap) {
        window.snap.pay(transactionToken, {
          onSuccess: function(result){
            /* You may add your own implementation here */
            console.log('Midtrans Success:', result);
            toast({ title: "Payment Successful", description: "Your plan will be updated shortly." });
            onOpenChange(false); // Close dialog on success
            // Note: Actual level update happens via webhook
          },
          onPending: function(result){
            /* You may add your own implementation here */
            console.log('Midtrans Pending:', result);
            toast({ title: "Payment Pending", description: `Waiting for payment confirmation (Order ID: ${result.order_id})` });
            onOpenChange(false); // Close dialog on pending
          },
          onError: function(result){
            /* You may add your own implementation here */
            console.error('Midtrans Error:', result);
            toast({ title: "Payment Error", description: result.status_message || "An error occurred during payment.", variant: "destructive" });
            setIsProcessing(false); // Allow user to try again
          },
          onClose: function(){
            /* You may add your own implementation here */
            console.log('Midtrans payment popup closed');
            // Only stop processing if not already successful or pending
            // Check status via API if needed, or assume closed means cancelled/failed for now
             if (isProcessing) { // Check if we were still in processing state
                 setIsProcessing(false);
                 toast({ title: "Payment Closed", description: "Payment window closed before completion.", variant: "default" });
             }
          }
        });
      } else {
        console.error("Midtrans Snap.js is not loaded. Ensure VITE_MIDTRANS_CLIENT_KEY is set and the script in index.html is correct.");
        throw new Error("Midtrans Snap.js is not loaded.");
      }
     // --- End Actual Implementation ---

    } catch (error: any) {
      console.error("Error initiating Midtrans payment:", error);
      toast({
        title: "Payment Initiation Failed",
        description: error.message || "Could not start the payment process. Please check console for details.",
        variant: "destructive",
      });
      setIsProcessing(false); // Stop loading on error
    }
    // Note: Don't set isProcessing to false here if snap.pay was called successfully,
    // as the callbacks will handle the final state. It's set in onError/onClose.
  };

  const handleProceedToPayment = () => {
    if (!user) {
      toast({ title: "Error", description: "User not found. Please sign in again.", variant: "destructive" });
      return;
    }
    if (!import.meta.env.VITE_MIDTRANS_CLIENT_KEY) {
       toast({ title: "Configuration Error", description: "Midtrans Client Key is missing in frontend environment.", variant: "destructive" });
       return;
    }
    // Use the correct function name here
    initiateMidtransPayment(user.id, user.email || '', selectedPlan);
  };

  // Ensure the component returns JSX
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Choose a plan to unlock more features and increase your daily quotas.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Select Plan:</Label>
            <RadioGroup
              value={selectedPlan}
              onValueChange={(value) => setSelectedPlan(value as Plan)}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="Premium" id="dlg-plan-premium" className="peer sr-only" />
                <Label
                  htmlFor="dlg-plan-premium"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
                >
                  <span className="font-semibold text-lg">Premium</span>
                  <span className="text-sm text-muted-foreground mt-1 text-center">Enhanced Access</span>
                  <span className="text-xs text-muted-foreground mt-2">(Price Placeholder)</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="Researcher" id="dlg-plan-researcher" className="peer sr-only" />
                <Label
                  htmlFor="dlg-plan-researcher"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
                >
                  <span className="font-semibold text-lg">Researcher</span>
                  <span className="text-sm text-muted-foreground mt-1 text-center">Full Access</span>
                   <span className="text-xs text-muted-foreground mt-2">(Price Placeholder)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
             <Label className="text-base font-semibold">Feature Comparison:</Label>
             <Card>
               <CardContent className="p-0">
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead className="w-[200px]">Feature</TableHead>
                       <TableHead className="text-center">Free</TableHead>
                       <TableHead className="text-center">Premium</TableHead>
                       <TableHead className="text-center">Researcher</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {featureData.map((item) => (
                       <TableRow key={item.feature}>
                         <TableCell className="font-medium">{item.feature}</TableCell>
                         <TableCell className="text-center text-xs sm:text-sm">
                           {item.free === 'No Access' ? <XIcon className="h-4 w-4 text-red-500 mx-auto" /> : item.free === 'Unlimited' ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : item.free}
                         </TableCell>
                         <TableCell className="text-center text-xs sm:text-sm">
                           {item.premium === 'No Access' ? <XIcon className="h-4 w-4 text-red-500 mx-auto" /> : item.premium === 'Unlimited' ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : item.premium}
                         </TableCell>
                         <TableCell className="text-center text-xs sm:text-sm">
                           {item.researcher === 'No Access' ? <XIcon className="h-4 w-4 text-red-500 mx-auto" /> : item.researcher === 'Unlimited' || item.researcher === 'Full Access' ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : item.researcher}
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </CardContent>
             </Card>
          </div>
        </div>
        <DialogFooter className="pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isProcessing}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleProceedToPayment} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isProcessing ? 'Processing...' : `Proceed to Payment for ${selectedPlan}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
