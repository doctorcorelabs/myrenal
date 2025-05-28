import React from 'react';
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface UpgradePlanDialogContentProps {
  onClose: () => void;
}

const UpgradePlanDialogContent: React.FC<UpgradePlanDialogContentProps> = ({
  onClose
}) => {
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Upgrade Your Plan</AlertDialogTitle>
        <AlertDialogDescription>
          You've reached the usage limit for this feature. 
          Upgrade your plan to continue using this feature and unlock additional benefits.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="py-4">
        <div className="space-y-4">
          <div className="flex items-center p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium">Premium Plan</h3>
              <p className="text-sm text-gray-500">Unlimited access to all features</p>
            </div>
            <Button 
              onClick={() => {
                // Implement your upgrade logic here
                window.open('/pricing', '_blank');
                onClose();
              }}
            >
              Upgrade
            </Button>
          </div>
        </div>
      </div>
      <AlertDialogFooter>
        <Button variant="outline" onClick={onClose}>
          Maybe Later
        </Button>
      </AlertDialogFooter>
    </>
  );
};

export default UpgradePlanDialogContent;