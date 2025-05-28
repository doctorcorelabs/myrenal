import React, { useState, useCallback, useRef, useEffect } from 'react'; // Consolidated imports
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Sparkles, SendHorizonal, Loader2, Paperclip, X, ArrowLeft } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom'; // Added Link import
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import * as pdfjsLib from 'pdfjs-dist';
import { useAuth } from '@/contexts/AuthContext'; // Added useAuth
import { supabase } from '@/lib/supabaseClient'; // Added supabase
import { useFeatureAccess } from '@/hooks/useFeatureAccess'; // Added useFeatureAccess

// Configure the worker source for pdfjs-dist
// Make sure the worker file is copied to your public directory during build
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// Define model types & message structure
type DeepSeekModel = 'deepseek-chat' | 'deepseek-reasoner';
interface Message {
  id: string; // Unique ID for React key
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
interface ExplorationThread {
  id: string; // Unique ID for React key
  initialModel: DeepSeekModel;
  messages: Message[];
  createdAt: Date;
}

const ExploreDeepSeek: React.FC = () => {
  const { toast } = useToast();
  // Get user, level
  const { user, level } = useAuth(); 
  const { checkAccess } = useFeatureAccess(); 

  const [prompt, setPrompt] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<DeepSeekModel>('deepseek-chat');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false); // General loading for main prompt
  const [error, setError] = useState<string | null>(null); // General error for main prompt
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null); // To store text from main file

  // State for history and thread interactions
  const [history, setHistory] = useState<ExplorationThread[]>([]);
  const [threadInputs, setThreadInputs] = useState<{ [threadId: string]: string }>({});
  const [threadLoading, setThreadLoading] = useState<{ [threadId: string]: boolean }>({}); // Loading state per thread
  const [threadErrors, setThreadErrors] = useState<{ [threadId: string]: string | null }>({}); // Error state per thread
  const [threadFiles, setThreadFiles] = useState<{ [threadId: string]: File | null }>({}); // State for files per thread
  const [threadExtractedTexts, setThreadExtractedTexts] = useState<{ [threadId: string]: string | null }>({}); // State for extracted text per thread
  const fileInputRef = React.useRef<HTMLInputElement>(null); // Ref for main file input
  const threadFileInputRefs = useRef<{ [threadId: string]: HTMLInputElement | null }>({}); // Refs for thread file inputs


  // --- Main Submit Handler (Non-Streaming) ---
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Check if there's either a prompt or a file with extracted text
    if (!prompt.trim() && !extractedText) {
      setError('Please enter a prompt or upload a file with text content.');
      return;
    }

    // --- Access Check ---
    const featureName: string = 'explore_deepseek';
    const access = await checkAccess(featureName);

    if (!access.allowed) {
      toast({
        title: "Access Denied",
        description: access.message || 'You do not have access to Explore DeepSeek.',
        variant: "destructive"
      });
      setError(access.message || 'Access denied for Explore DeepSeek.');
      setIsLoading(false);
      return;
    }
    // --- End Access Check ---

    setIsLoading(true);
    setError(null);
    setResponse('');

    const workerUrl = import.meta.env.VITE_DEEPSEEK_WORKER_URL;
    if (!workerUrl) {
      setError('DeepSeek Worker URL not configured (VITE_DEEPSEEK_WORKER_URL).');
      setIsLoading(false);
      return;
    }

    // Combine prompt and extracted text if available
    let finalUserContent = prompt;
    if (extractedText && selectedFile) {
        finalUserContent = `[Content from ${selectedFile.name}]:\n\n${extractedText}\n\n[User Prompt]:\n\n${prompt || '(No additional prompt)'}`;
    } else if (!prompt.trim() && !selectedFile) {
        setError('Please enter a prompt or upload a file with text content.');
        setIsLoading(false);
        return;
    }

    const messages: Omit<Message, 'id' | 'timestamp'>[] = [
      { role: 'system', content: 'You are a helpful medical assistant.' },
      { role: 'user', content: finalUserContent },
    ];

    try {
      const res = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Worker request failed: ${res.status} ${res.statusText} - ${errorText}`);
      }

      const data = await res.json();
      if (data.responseText) {
        setResponse(data.responseText);
      } else {
        console.warn("Received response without responseText:", data);
        setError("Received an empty or invalid response from the AI.");
        setResponse('');
      }

    } catch (err) {
      console.error('Error fetching from worker or parsing JSON:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setResponse('');
    } finally {
      setIsLoading(false);
      // Clear file state after submission attempt (success or fail)
      setSelectedFile(null);
      setExtractedText(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [prompt, selectedModel, extractedText, selectedFile, toast, checkAccess, user, level]);


  // --- File Handling Logic (Main Prompt) ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setExtractedText(null); // Reset while processing
    setError(null);
    setIsLoading(true); // Show general loading indicator

    try {
      if (file.type === 'text/plain') {
        const text = await file.text();
        setExtractedText(text);
        toast({ title: "Text file loaded successfully." });
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
           // Ensure item.str exists before joining
          fullText += textContent.items.map((item: any) => item.str || '').join(' ') + '\n';
        }
        setExtractedText(fullText.trim());
        toast({ title: "PDF text extracted successfully." });
      } else {
        throw new Error('Unsupported file type. Please upload TXT or PDF.');
      }
    } catch (err) {
      console.error("Error processing file:", err);
      const errorMsg = err instanceof Error ? `Error processing file: ${err.message}` : 'Unknown error processing file.';
      setError(errorMsg);
      toast({ title: "File Processing Error", description: errorMsg, variant: "destructive" });
      setSelectedFile(null); // Clear invalid file
      setExtractedText(null);
    } finally {
      setIsLoading(false); // Hide general loading indicator
    }

     // Reset the input value so the same file can be selected again if removed
     if (event.target) {
        event.target.value = '';
     }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setExtractedText(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the input
    }
  };

  // --- Thread File Handling Logic ---
  const handleThreadFileChange = async (event: React.ChangeEvent<HTMLInputElement>, threadId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setThreadFiles(prev => ({ ...prev, [threadId]: file }));
    setThreadExtractedTexts(prev => ({ ...prev, [threadId]: null })); // Reset while processing
    setThreadErrors(prev => ({ ...prev, [threadId]: null })); // Clear previous errors for this thread
    setThreadLoading(prev => ({ ...prev, [threadId]: true })); // Show loading for this thread

    try {
      let extractedThreadText = '';
      if (file.type === 'text/plain') {
        extractedThreadText = await file.text();
        toast({ title: `TXT loaded for thread.` });
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
           // Ensure item.str exists before joining
          fullText += textContent.items.map((item: any) => item.str || '').join(' ') + '\n';
        }
        extractedThreadText = fullText.trim();
        toast({ title: `PDF text extracted for thread.` });
      } else {
        throw new Error('Unsupported file type. Please upload TXT or PDF.');
      }
      setThreadExtractedTexts(prev => ({ ...prev, [threadId]: extractedThreadText }));
    } catch (err) {
      console.error(`Error processing file for thread ${threadId}:`, err);
      const errorMsg = err instanceof Error ? `Error processing file: ${err.message}` : 'Unknown error processing file.';
      setThreadErrors(prev => ({ ...prev, [threadId]: errorMsg }));
      toast({ title: "File Processing Error", description: errorMsg, variant: "destructive" });
      setThreadFiles(prev => ({ ...prev, [threadId]: null })); // Clear invalid file for this thread
      setThreadExtractedTexts(prev => ({ ...prev, [threadId]: null }));
    } finally {
      setThreadLoading(prev => ({ ...prev, [threadId]: false })); // Hide loading for this thread
    }

    // Reset the input value so the same file can be selected again if removed
    if (event.target) {
      event.target.value = '';
    }
  };

  const triggerThreadFileSelect = (threadId: string) => {
    threadFileInputRefs.current[threadId]?.click();
  };

  const removeThreadFile = (threadId: string) => {
    setThreadFiles(prev => ({ ...prev, [threadId]: null }));
    setThreadExtractedTexts(prev => ({ ...prev, [threadId]: null }));
    const inputRef = threadFileInputRefs.current[threadId];
    if (inputRef) {
      inputRef.value = ''; // Clear the specific input
    }
  };


  // --- Explore Topic Handler ---
  const handleExploreClick = () => {
    // Include extracted text if available when creating the history
    let userContent = prompt;
    if (extractedText && selectedFile) {
        userContent = `[Content from ${selectedFile.name}]:\n\n${extractedText}\n\n[User Prompt]:\n\n${prompt || '(No additional prompt)'}`;
    }

    if (!response && !userContent) return; // Check combined content

    const systemMessage: Message = { id: crypto.randomUUID(), role: 'system', content: 'You are a helpful medical assistant.', timestamp: new Date(Date.now() - 2000) };
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: userContent, timestamp: new Date(Date.now() - 1000) };
    const assistantMessage: Message = { id: crypto.randomUUID(), role: 'assistant', content: response, timestamp: new Date() };

    const newThread: ExplorationThread = {
      id: crypto.randomUUID(),
      initialModel: selectedModel,
      messages: [systemMessage, userMessage, assistantMessage],
      createdAt: new Date()
    };

    setHistory(prev => [...prev, newThread]);
    setPrompt(''); // Clear main prompt
    setResponse('');
    setSelectedFile(null); // Clear file state
    setExtractedText(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    setError(null);
    toast({ title: "Added to Exploration History" });
  };

  // --- Thread Input Change Handler ---
  const handleThreadInputChange = (threadId: string, value: string) => {
    setThreadInputs(prev => ({ ...prev, [threadId]: value }));
  };

  // --- Send Message within a Thread Handler (Non-Streaming) ---
  const handleSendInThread = async (threadId: string) => {
    const thread = history.find(t => t.id === threadId);
    const threadPrompt = threadInputs[threadId]?.trim() || '';
    const threadFile = threadFiles[threadId];
    const threadFileText = threadExtractedTexts[threadId];

    // Check if there's either a prompt or a file with extracted text for the thread
    if (!thread || (!threadPrompt && !threadFileText)) {
      setThreadErrors(prev => ({ ...prev, [threadId]: "Follow-up prompt or uploaded file content is required." }));
      return;
    }

    // --- Access Check for Thread ---
    const featureName: string = 'explore_deepseek';
    const access = await checkAccess(featureName);

    if (!access.allowed) {
      toast({
        title: "Access Denied",
        description: access.message || 'You do not have access to Explore DeepSeek.',
        variant: "destructive"
      });
      setThreadErrors(prev => ({ ...prev, [threadId]: access.message || 'Access denied for Explore DeepSeek.' }));
      setThreadLoading(prev => ({ ...prev, [threadId]: false }));
      return;
    }
    // --- End Access Check ---


    setThreadLoading(prev => ({ ...prev, [threadId]: true }));
    setThreadErrors(prev => ({ ...prev, [threadId]: null }));

    // Combine thread prompt and extracted text if available
    let finalThreadUserContent = threadPrompt;
    if (threadFileText && threadFile) {
        finalThreadUserContent = `[Content from ${threadFile.name}]:\n\n${threadFileText}\n\n[User Prompt]:\n\n${threadPrompt || '(No additional prompt)'}`;
    }

    const newUserMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: finalThreadUserContent,
      timestamp: new Date(Date.now() - 1000)
    };

    // Get previous messages *excluding* system messages for the API call history
    const messagesForApi = thread.messages
        .filter(msg => msg.role !== 'system')
        .map(({ role, content }) => ({ role, content }));
    // Add the new combined user message
    messagesForApi.push({ role: newUserMessage.role, content: newUserMessage.content });
    // Prepend the original system message (if needed by API, often good practice)
    messagesForApi.unshift({ role: 'system', content: 'You are a helpful medical assistant.' });


    const workerUrl = import.meta.env.VITE_DEEPSEEK_WORKER_URL;
    if (!workerUrl) {
      setThreadErrors(prev => ({ ...prev, [threadId]: 'Worker URL not configured.' }));
      setThreadLoading(prev => ({ ...prev, [threadId]: false }));
      return;
    }

    try {
      const res = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesForApi,
          model: thread.initialModel,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Worker request failed: ${res.status} ${res.statusText} - ${errorText}`);
      }

      const data = await res.json();
      let modelResponseContent = '';
      if (data.responseText) {
        modelResponseContent = data.responseText;
      } else {
        console.warn("Received thread response without responseText:", data);
        throw new Error("Received an empty or invalid response from the AI for the thread.");
      }

      const newAssistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: modelResponseContent,
        timestamp: new Date()
      };

      // Update history, adding the *original* user message (combined) and the assistant response
      setHistory(prevHistory =>
        prevHistory.map(t =>
          t.id === threadId
            ? { ...t, messages: [...t.messages, newUserMessage, newAssistantMessage] }
            : t
        )
      );
      // Clear the input and file state for this specific thread
      setThreadInputs(prev => ({ ...prev, [threadId]: '' }));
      setThreadFiles(prev => ({ ...prev, [threadId]: null }));
      setThreadExtractedTexts(prev => ({ ...prev, [threadId]: null }));
      const inputRef = threadFileInputRefs.current[threadId];
      if (inputRef) {
        inputRef.value = '';
      }

      // Scroll the specific thread content area to the bottom
      // Use setTimeout to allow the DOM to update before scrolling
      setTimeout(() => {
        const contentElement = document.getElementById(`thread-content-${threadId}`);
        if (contentElement) {
          contentElement.scrollTop = contentElement.scrollHeight;
        }
      }, 0);

    } catch (err) {
      console.error("Error in handleSendInThread or parsing JSON:", err);
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred.';
      setThreadErrors(prev => ({ ...prev, [threadId]: errorMsg }));
      toast({ title: "Error Sending Message", description: errorMsg, variant: "destructive" });
    } finally {
      setThreadLoading(prev => ({ ...prev, [threadId]: false }));
    }
  };


  // --- Render Logic ---
  return (
    <>
      <PageHeader
        title="Jelajahi DeepSeek"
        subtitle="Manfaatkan AI DeepSeek untuk analisis mendalam tentang data dan penelitian terkait ginjal."
      />
      <div className="container max-w-4xl mx-auto px-4 py-12 space-y-6">
        {/* Main Interaction Area */}
        <img src="/deep fix.png" alt="DeepSeek" style={{ display: 'block', margin: '0 auto', width: '300px', marginBottom: '10px' }} />
        <Card>
          <CardHeader><CardTitle>Start New Exploration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {error && ( // Show main error here
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {/* Prompt Input & File Upload */}
            <div className="space-y-2">
              <Label htmlFor="prompt">Enter your prompt (or upload a TXT/PDF):</Label>
              <div className="relative">
                 <Textarea
                   id="prompt"
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   placeholder={selectedFile ? `Using content from ${selectedFile.name}. Add additional instructions here...` : "Ask DeepSeek..."}
                   rows={5}
                   disabled={isLoading} // Use general isLoading here
                   className="pr-10" // Add padding for the button
                 />
                 <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-2 right-2 h-7 w-7"
                    onClick={triggerFileSelect}
                    title="Attach File (TXT/PDF)"
                    disabled={isLoading} // Use general isLoading
                 >
                    <Paperclip className="h-4 w-4" />
                    <span className="sr-only">Attach File</span>
                 </Button>
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".txt,.pdf" // Accept only text and pdf files
                    disabled={isLoading} // Use general isLoading
                 />
              </div>
               {/* Display selected file */}
               {selectedFile && (
                 <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                   <Badge variant="secondary" className="flex items-center gap-1">
                     <Paperclip className="h-3 w-3" />
                     {selectedFile.name}
                   </Badge>
                   <Button variant="ghost" size="icon" onClick={removeSelectedFile} className="h-6 w-6" title="Remove file" disabled={isLoading}>
                     <X className="h-4 w-4" />
                     <span className="sr-only">Remove file</span>
                   </Button>
                 </div>
               )}
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label>Select Model:</Label>
              <RadioGroup value={selectedModel} onValueChange={(value: string) => setSelectedModel(value as DeepSeekModel)} className="flex space-x-4" disabled={isLoading}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="deepseek-chat" id="model-chat" /><Label htmlFor="model-chat">Chat (V3)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="deepseek-reasoner" id="model-reasoner" /><Label htmlFor="model-reasoner">Reasoner (R1)</Label></div>
              </RadioGroup>
            </div>
            {/* Submit Button - Disable if no prompt AND no file */}
            <Button onClick={handleSubmit} disabled={isLoading || (!prompt.trim() && !selectedFile)}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : 'Submit Prompt'}
            </Button>
          </CardContent>
        </Card>

        {/* Current Response Area */}
        {(response || (isLoading && !error)) && (
          <Card>
             <CardHeader><CardTitle>Current Response from {selectedModel}</CardTitle></CardHeader>
             <CardContent>
               {/* Added prose classes */}
               <div className="p-4 border rounded-md bg-gray-50 text-justify min-h-[50px] gemini-response-container prose prose-sm dark:prose-invert max-w-none">
                 {response ? (
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>
                     {response}
                   </ReactMarkdown>
                 ) : (
                   isLoading && <span className="text-gray-500">Generating response...</span> // Show loading text for non-streaming
                 )}
               </div>
             </CardContent>
             {response && !isLoading && (
               <CardFooter className="flex justify-end p-4 border-t">
                 <Button variant="secondary" onClick={handleExploreClick}><Sparkles className="mr-2 h-4 w-4" /> Explore Topic</Button>
               </CardFooter>
             )}
          </Card>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-10 space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight text-center border-t pt-6">Exploration Threads</h2>
            {history.map((thread) => (
              <Card key={thread.id} className="bg-muted/50 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Exploration Thread</CardTitle>
                  <p className="text-xs text-muted-foreground">Started: {thread.createdAt.toLocaleString()} | Model: {thread.initialModel}</p>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[500px] overflow-y-auto pr-4">
                  {/* Render messages within the thread, filtering out system messages */}
                  {thread.messages.filter(message => message.role !== 'system').map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-lg max-w-[80%] ${message.role === 'user' ? 'bg-background border' : 'bg-background border'}`}>
                        {message.content && (
                          <div className="overflow-x-auto">
                             <div className="max-w-none prose prose-sm dark:prose-invert text-justify">
                               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                 {message.content}
                               </ReactMarkdown>
                             </div>
                          </div>
                        )}
                        <p className="text-xs opacity-70 mt-1.5 text-right">{message.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                  {/* Loading indicator for this thread */}
                  {threadLoading[thread.id] && (
                    <div className="flex justify-start">
                      <div className="p-3 rounded-lg bg-background border animate-pulse"><Loader2 className="h-4 w-4 animate-spin" /></div>
                    </div>
                  )}
                  {/* Error specific to this thread */}
                  {threadErrors[thread.id] && (
                    <Alert variant="destructive" className="mt-2">
                      <Terminal className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{threadErrors[thread.id]}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                {/* Input area for follow-up in this thread */}
                <CardFooter className="border-t pt-4 flex flex-col gap-2">
                   {/* Display selected file for this thread */}
                   {threadFiles[thread.id] && (
                     <div className="flex items-center justify-between p-2 border rounded-md bg-muted w-full">
                       <Badge variant="secondary" className="flex items-center gap-1">
                         <Paperclip className="h-3 w-3" />
                         {threadFiles[thread.id]?.name}
                       </Badge>
                       <Button variant="ghost" size="icon" onClick={() => removeThreadFile(thread.id)} className="h-6 w-6" title="Remove file" disabled={threadLoading[thread.id]}>
                         <X className="h-4 w-4" />
                         <span className="sr-only">Remove file</span>
                       </Button>
                     </div>
                   )}
                  <div className="flex items-center gap-2 w-full relative">
                     <Textarea
                       placeholder={threadFiles[thread.id] ? `Using content from ${threadFiles[thread.id]?.name}. Add follow-up...` : "Follow-up prompt..."}
                       value={threadInputs[thread.id] || ''}
                       onChange={(e) => handleThreadInputChange(thread.id, e.target.value)}
                       rows={2}
                       className="flex-grow resize-none pr-10"
                       disabled={threadLoading[thread.id]}
                       onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendInThread(thread.id); } }}
                     />
                     {/* File Attach Button for Thread */}
                     <Button
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-1 right-12 h-7 w-7"
                        onClick={() => triggerThreadFileSelect(thread.id)}
                        title="Attach File (TXT/PDF)"
                        disabled={threadLoading[thread.id]}
                     >
                        <Paperclip className="h-4 w-4" />
                        <span className="sr-only">Attach File</span>
                     </Button>
                     <input
                        type="file"
                        ref={el => threadFileInputRefs.current[thread.id] = el}
                        onChange={(e) => handleThreadFileChange(e, thread.id)}
                        className="hidden"
                        accept=".txt,.pdf"
                        disabled={threadLoading[thread.id]}
                     />
                     {/* Send Button */}
                     <Button
                       size="icon"
                       onClick={() => handleSendInThread(thread.id)}
                       disabled={threadLoading[thread.id] || (!threadInputs[thread.id]?.trim() && !threadFiles[thread.id])}
                       className="shrink-0"
                     >
                       <SendHorizonal className="h-4 w-4" />
                       <span className="sr-only">Send</span>
                     </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Back to Screening Button */}
        <div className="mt-12 flex justify-center">
          <Button asChild variant="outline">
            <Link to="/screening" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </Button>
        </div>

      </div>
    </>
  );
};

export default ExploreDeepSeek;
