// src/components/NucleusSubmissionForm.tsx
import React, { useState, useRef, useEffect } from 'react'; // Added useRef, useEffect
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

// Define the structure for submission data
export interface NucleusSubmissionData {
  title: string;
  category?: string;
  author?: string; // User submitting might provide their name
  location?: string;
  featured_image_url?: string;
  subtitle?: string;
  summary?: string;
  key_insights?: string; // Stored as single text block
  content: string;
  name?: string; // Optional field for user's name
  email?: string; // Optional field for user's email
}

interface NucleusSubmissionFormProps {
  onSaveSuccess: () => void;
  onCancel: () => void;
}

const NucleusSubmissionForm: React.FC<NucleusSubmissionFormProps> = ({
  onSaveSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<NucleusSubmissionData>({
    title: '',
    content: '',
    // Initialize other optional fields as empty or undefined
    category: '',
    author: '',
    location: '',
    featured_image_url: '',
    subtitle: '',
    summary: '',
    key_insights: '',
    name: '',
    email: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null); // State for Turnstile token
  const turnstileRef = useRef<HTMLDivElement>(null); // Ref for Turnstile widget container
  const { toast } = useToast();

  // Effect to render Turnstile widget
  useEffect(() => {
    if (turnstileRef.current && !turnstileRef.current.hasChildNodes()) { // Check if widget already rendered
      // Ensure window.turnstile is available
      if (typeof window !== 'undefined' && window.turnstile) {
        window.turnstile.render(turnstileRef.current, {
          sitekey: '0x4AAAAAABJj5Q0iqgbTzacQ', // Your Site Key
          callback: function(token) {
            console.log(`Challenge Success: ${token}`);
            setTurnstileToken(token);
          },
          'error-callback': function() {
            console.error('Turnstile challenge failed');
            setTurnstileToken(null); // Reset token on error
            toast({
              title: "Verification Failed",
              description: "Please try the CAPTCHA again.",
              variant: "destructive",
            });
          },
          'expired-callback': function() {
            console.warn('Turnstile challenge expired');
            setTurnstileToken(null); // Reset token on expiry
            // Optionally re-render or prompt user
             toast({
              title: "Verification Expired",
              description: "CAPTCHA expired, please try again.",
              variant: "default", // Changed to default variant
            });
             // Consider resetting the widget if needed: window.turnstile.reset(widgetId);
          },
          theme: 'light', // Or 'dark' or 'auto'
        });
      } else {
        console.error("Turnstile script not loaded yet.");
        // Optionally add a retry mechanism or error message
      }
    }
    // Cleanup function (optional, if you need to explicitly remove the widget)
    // return () => {
    //   if (turnstileRef.current) {
    //      // Find the widget ID if needed for reset/remove
    //      // window.turnstile.remove(widgetId);
    //   }
    // };
  }, [toast]); // Re-run if toast changes (though unlikely, good practice)


  const handleInputChange = (field: keyof NucleusSubmissionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContentChange = (value: string | undefined) => {
    setFormData(prev => ({ ...prev, content: value || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- Turnstile Check ---
    if (!turnstileToken) {
      toast({
        title: "Verification Required",
        description: "Please complete the CAPTCHA verification before submitting.",
        variant: "destructive"
      });
      return; // Stop submission if Turnstile token is missing
    }
    // --- End Turnstile Check ---

    setIsSaving(true);

    if (!formData.title || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Title and Content are required.",
        variant: "destructive"
      });
      setIsSaving(false); // Removed duplicate setIsSaving(false)
      return;
    }

    try {
      // Prepare data for the Netlify function
      const submissionPayload = {
        formData: { // Nest form data under a key
          title: formData.title,
          category: formData.category || null,
          author: formData.author || null, // This could be the submitter's name or proposed author
          location: formData.location || null,
          featured_image_url: formData.featured_image_url || null,
          subtitle: formData.subtitle || null,
          summary: formData.summary || null,
          key_insights: formData.key_insights || null, // Send as single text block
          content: formData.content,
          name: formData.name || null, // Submitter's name
          email: formData.email || null, // Submitter's email
          // status defaults to 'pending' in the database
        },
        turnstileToken: turnstileToken // Send the token
      };

      // --- Call Netlify Function ---
      const response = await fetch('/.netlify/functions/submit-nucleus-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionPayload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Submission failed after verification.');
      }
      // --- End Netlify Function Call ---

      /* // Old Supabase direct insert logic (commented out)
      const { error } = await supabase
        .from('nucleus_submissions')
        .insert(submissionDataToSave);

      if (error) throw error;
      */

      // --- Success Toast and Callback ---
      toast({
        title: "Success",
        description: "Your idea has been submitted successfully. Thank you!"
      });
      onSaveSuccess(); // Callback to close modal or reset state

    } catch (err: any) {
      console.error("Error submitting idea via Netlify function:", err);
      toast({
        title: "Error Submitting Idea",
        description: err.message || "Could not submit your idea. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       {/* Optional Name and Email */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div>
           <Label htmlFor="name">Your Name (Optional)</Label>
           <Input
             id="name"
             name="name"
             value={formData.name ?? ''}
             onChange={(e) => handleInputChange('name', e.target.value)}
             disabled={isSaving}
             placeholder="Let us know who you are"
           />
         </div>
         <div>
           <Label htmlFor="email">Your Email (Optional)</Label>
           <Input
             id="email"
             name="email"
             type="email"
             value={formData.email ?? ''}
             onChange={(e) => handleInputChange('email', e.target.value)}
             disabled={isSaving}
             placeholder="So we can follow up if needed"
           />
         </div>
       </div>

      {/* --- Fields from NucleusPostForm (excluding slug) --- */}
      <div>
        <Label htmlFor="title">Idea Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          required
          disabled={isSaving}
          placeholder="Give your idea a catchy title"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category (Optional)</Label>
          <Input
            id="category"
            name="category"
            value={formData.category ?? ''}
            onChange={(e) => handleInputChange('category', e.target.value)}
            disabled={isSaving}
            placeholder="e.g., AI in Medicine"
          />
        </div>
        <div>
          <Label htmlFor="author">Proposed Author (Optional)</Label>
          <Input
            id="author"
            name="author"
            value={formData.author ?? ''}
            onChange={(e) => handleInputChange('author', e.target.value)}
            disabled={isSaving}
            placeholder="Who should write this?"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Location (Optional)</Label>
          <Input
            id="location"
            name="location"
            value={formData.location ?? ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            disabled={isSaving}
            placeholder="e.g., Conference Name, City"
          />
        </div>
        <div>
          <Label htmlFor="featured_image_url">Featured Image URL (Optional)</Label>
          <Input
            id="featured_image_url"
            name="featured_image_url"
            type="url"
            value={formData.featured_image_url ?? ''}
            onChange={(e) => handleInputChange('featured_image_url', e.target.value)}
            disabled={isSaving}
            placeholder="Link to a relevant image"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="subtitle">Subtitle (Optional)</Label>
        <Input
          id="subtitle"
          name="subtitle"
          value={formData.subtitle ?? ''}
          onChange={(e) => handleInputChange('subtitle', e.target.value)}
          disabled={isSaving}
        />
      </div>

      <div>
        <Label htmlFor="summary">Summary (Optional)</Label>
        <Textarea
          id="summary"
          name="summary"
          value={formData.summary ?? ''}
          onChange={(e) => handleInputChange('summary', e.target.value)}
          rows={3}
          disabled={isSaving}
          placeholder="Briefly describe the main point"
        />
      </div>

      <div>
        <Label htmlFor="key_insights">Key Insights (Optional, one per line)</Label>
        <Textarea
          id="key_insights"
          name="key_insights"
          value={formData.key_insights ?? ''}
          onChange={(e) => handleInputChange('key_insights', e.target.value)}
          rows={5}
          disabled={isSaving}
          placeholder="Enter key takeaways, each on a new line..."
        />
      </div>

      <div data-color-mode="light"> {/* Keep light mode for editor consistency */}
        <Label htmlFor="content">Content / Your Idea Details (Markdown)</Label>
        <MDEditor
          id="content"
          value={formData.content}
          onChange={handleContentChange}
           preview="live"
           height={300} // Adjusted height for submission form
           // Removed required prop, validation is handled in handleSubmit
         />
          <p className="text-xs text-muted-foreground mt-1">Explain your idea in detail here. Markdown is supported.</p>
      </div>

      {/* --- End of adapted fields --- */}

      {/* Turnstile Widget Container */}
      <div ref={turnstileRef} className="mt-4 mb-4 flex justify-center"></div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        {/* Disable submit if saving or Turnstile token is missing */}
        <Button type="submit" disabled={isSaving || !turnstileToken}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSaving ? 'Submitting...' : 'Submit Idea'}
        </Button>
      </div>
    </form>
  );
};

export default NucleusSubmissionForm;
