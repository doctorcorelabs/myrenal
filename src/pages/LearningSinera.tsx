import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

// Define passwords and placeholder URLs
const passwords: { [key: number]: string } = {
  1: 'arunika',
  2: 'scientia',
  3: 'invictus',
};

// Renamed constant and updated URLs
const contentUrls: { [key: number]: string } = {
  1: 'https://www.canva.com/design/DAGlW-pOBnk/AzmLbpUod3x5VL_KXPaAjQ/view', // Literature Review Chapter 1
  2: 'https://www.canva.com/design/DAGlaZcWMCU/4BLJXJ7lyUTXB7bNKIi5MA/view', // Literature Review Chapter 2
  3: 'https://www.canva.com/design/DAGlsc1WIuI/qYvR2JomplLQGCZrJYeyhA/view', // Literature Review Chapter 3
};

const LearningSinera: React.FC = () => {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authorizedChapter, setAuthorizedChapter] = useState<number | null>(null);
  const { toast } = useToast();

  const handleButtonClick = (chapter: number) => {
    // If already authorized, don't ask for password again
    if (authorizedChapter === chapter) {
      return;
    }
    // Reset previous authorization if switching chapters
    if (authorizedChapter !== null && authorizedChapter !== chapter) {
        setAuthorizedChapter(null);
    }
    setSelectedChapter(chapter);
    setPasswordInput(''); // Clear previous input
    setIsDialogOpen(true);
  };

  const handlePasswordSubmit = () => {
    if (selectedChapter && passwords[selectedChapter] === passwordInput) {
      setAuthorizedChapter(selectedChapter);
      setIsDialogOpen(false);
      toast({
        title: 'Access Granted',
        description: `You can now view Chapter ${selectedChapter}.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Incorrect password. Please try again.',
      });
    }
  };

  // Simplified iframe rendering for Google Drive
  const renderIframe = () => {
    if (!authorizedChapter) return null;

    const url = contentUrls[authorizedChapter];

    // Basic iframe styling, adjust aspect ratio or height as needed
    return (
      <div className="mt-8 aspect-video w-full">
        <iframe
          src={url}
          className="w-full h-full border-0"
          allow="autoplay" // Google Drive might use this
          title={`Literature Review Chapter ${authorizedChapter}`}
        ></iframe>
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title="SINERA X DaivanLabs"
        subtitle="Exclusive Literature Review Materials"
      />
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8 p-6 bg-secondary/30 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-2">Access Chapters</h3>
            <p className="text-muted-foreground mb-4">
                Click a chapter button below. You will be prompted to enter a password to view the presentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
            {[1, 2, 3].map((chapter) => (
                <Button
                key={chapter}
                onClick={() => handleButtonClick(chapter)}
                disabled={authorizedChapter === chapter} // Disable if already authorized
                className="flex-1"
                >
                Literature Review Chapter {chapter}
                </Button>
            ))}
            </div>
        </div>


        {renderIframe()}

        {/* Password Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Enter Password</DialogTitle>
              <DialogDescription>
                Enter the password for Chapter {selectedChapter} to view the content.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="col-span-3"
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()} // Allow Enter key submission
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                 <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="button" onClick={handlePasswordSubmit}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mt-12 text-center">
          <Link to="/tools/learning-resources">
            <Button variant="outline" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Learning Resources
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default LearningSinera;
