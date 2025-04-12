import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Removed Textarea import as it's replaced by MDEditor for the content field
// import { Textarea } from '@/components/ui/textarea'; 
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { Textarea } from '@/components/ui/textarea'; // Keep Textarea for summary and key_insights

export interface NucleusPostData {
  id?: number;
  title: string;
  slug: string;
  summary: string;
  featured_image_url: string;
  content: string;
  published_at?: string;
  category?: string;
  subtitle?: string;
  author?: string;
  location?: string;
  key_insights?: string[];
}

interface NucleusPostFormProps {
  formData: NucleusPostData;
  keyInsightsText: string;
  onFormChange: (field: keyof NucleusPostData, value: string) => void;
  onKeyInsightsChange: (text: string) => void;
  onSaveSuccess: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const NucleusPostForm: React.FC<NucleusPostFormProps> = ({
  formData,
  keyInsightsText,
  onFormChange,
  onKeyInsightsChange,
  onSaveSuccess,
  onCancel,
  isEditing
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing); // Initialize based on editing status
  const { toast } = useToast();

  // Effect to auto-generate slug from title for new posts
  useEffect(() => {
    // Only run if creating a new post AND the slug hasn't been manually edited
    if (!isEditing && !slugManuallyEdited && formData.title) {
      const generatedSlug = generateSlug(formData.title);
      // Update the form data directly via the callback prop
      onFormChange('slug', generatedSlug);
    }
    // Dependencies: Run when title changes, but respect manual edits and editing status
  }, [formData.title, isEditing, slugManuallyEdited, onFormChange]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (!formData.title || !formData.slug || !formData.content) {
      toast({ 
        title: "Validation Error", 
        description: "Title, Slug, and Content are required.", 
        variant: "destructive" 
      });
      setIsSaving(false);
      return;
    }

    try {
      const postDataToSave = {
        title: formData.title,
        slug: formData.slug,
        summary: formData.summary || null,
        featured_image_url: formData.featured_image_url || null,
        content: formData.content,
        category: formData.category || null,
        subtitle: formData.subtitle || null,
        author: formData.author || null,
        location: formData.location || null,
        key_insights: keyInsightsText.split('\n').map(s => s.trim()).filter(s => s),
      };

      let error = null;
      if (formData.id) {
        const { error: updateError } = await supabase
          .from('nucleus_posts')
          .update(postDataToSave)
          .eq('id', formData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('nucleus_posts')
          .insert(postDataToSave);
        error = insertError;
      }

      if (error) throw error;

      toast({ 
        title: "Success", 
        description: `Post ${formData.id ? 'updated' : 'created'} successfully.` 
      });
      onSaveSuccess();

    } catch (err: any) {
      console.error("Error saving post:", err);
      if (err.code === '23505' && err.message.includes('nucleus_posts_slug_key')) {
        toast({ 
          title: "Error Saving Post", 
          description: "The 'slug' must be unique. Please choose a different slug.", 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Error Saving Post", 
          description: err.message || "Could not save the post.", 
          variant: "destructive" 
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    // Removed fixed height and overflow from form; DialogContent will handle scrolling.
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title" 
          name="title" 
          value={formData.title} 
          onChange={(e) => onFormChange('title', e.target.value)} 
          required 
          disabled={isSaving} 
        />
      </div>
      <div>
        <Label htmlFor="slug">Slug (URL Path)</Label>
        <Input 
          id="slug" 
          name="slug" 
          value={formData.slug} 
          onChange={(e) => { 
            onFormChange('slug', e.target.value); 
            setSlugManuallyEdited(true); 
          }} 
          required 
          disabled={isSaving} 
        />
        {!slugManuallyEdited && !isEditing && formData.slug && (
          <p className="text-xs text-muted-foreground mt-1">Auto-generated from title.</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category (Optional)</Label>
          <Input 
            id="category" 
            name="category" 
            value={formData.category ?? ''} 
            onChange={(e) => onFormChange('category', e.target.value)} 
            disabled={isSaving} 
            placeholder="e.g., Clinical Learning"
          />
        </div>
        <div>
          <Label htmlFor="author">Author (Optional)</Label>
          <Input 
            id="author" 
            name="author" 
            value={formData.author ?? ''} 
            onChange={(e) => onFormChange('author', e.target.value)} 
            disabled={isSaving} 
            placeholder="e.g., Your Name"
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
            onChange={(e) => onFormChange('location', e.target.value)} 
            disabled={isSaving} 
            placeholder="e.g., JAKARTA"
          />
        </div>
        <div>
          <Label htmlFor="featured_image_url">Featured Image URL (Optional)</Label>
          <Input 
            id="featured_image_url" 
            name="featured_image_url" 
            type="url" 
            value={formData.featured_image_url ?? ''} 
            onChange={(e) => onFormChange('featured_image_url', e.target.value)} 
            disabled={isSaving} 
          />
        </div>
      </div>
      <div>
        <Label htmlFor="subtitle">Subtitle (Optional)</Label>
        <Input 
          id="subtitle" 
          name="subtitle" 
          value={formData.subtitle ?? ''} 
          onChange={(e) => onFormChange('subtitle', e.target.value)} 
          disabled={isSaving} 
        />
      </div>
      <div>
        <Label htmlFor="summary">Summary (Optional)</Label>
        <Textarea 
          id="summary" 
          name="summary" 
          value={formData.summary ?? ''} 
          onChange={(e) => onFormChange('summary', e.target.value)} 
          rows={3} 
          disabled={isSaving} 
        />
      </div>
      <div>
        <Label htmlFor="key_insights">Key Insights (Optional, one per line)</Label>
        <Textarea 
          id="key_insights" 
          name="key_insights" 
          value={keyInsightsText} 
          onChange={(e) => onKeyInsightsChange(e.target.value)} 
          rows={5} 
          disabled={isSaving} 
          placeholder="Enter each key insight on a new line..."
        />
      </div>
      <div data-color-mode="light"> {/* Added data-color-mode wrapper for light theme */}
        <Label htmlFor="content">Content (Markdown)</Label>
        <MDEditor
          id="content"
          value={formData.content}
          onChange={(value) => onFormChange('content', value || '')}
          preview="live" // Options: live, edit, preview
          // Removed fixed height to allow natural expansion; parent DialogContent handles scroll
          // height={400}
          height={500}
          // Removed inline style to prevent potential conflicts with Dialog scroll management
          // disabled={isSaving} // MDEditor doesn't have a direct disabled prop, handle logic if needed
        />
        {/* Removed the old helper text as the editor is self-explanatory */}
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSaving ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
        </Button>
      </div>
    </form>
  );
};

export default NucleusPostForm;
