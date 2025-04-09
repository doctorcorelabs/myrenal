import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Upload, X, File as FileIcon, ArrowLeft, Loader2, Sparkles, SendHorizonal, Paperclip } from "lucide-react";
import { useFeatureAccess } from '@/hooks/useFeatureAccess'; // Import hook
import { FeatureName } from '@/lib/quotas'; // Import FeatureName from quotas.ts
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from 'react-markdown';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- System Instructions ---
const systemInstructions = {
  "none": { label: "None", text: "" },
  "medical-research-assistant": {
    label: "Medical Research Exploration Assistant",
    text: `Core Role:
You are an AI assistant specialized in Medical Research Exploration. Your primary function is to assist researchers, clinicians, students, and other professionals in navigating, understanding, synthesizing, and analyzing the vast landscape of medical and biomedical research information.

Key Responsibilities & Capabilities:

Information Retrieval:

Search and retrieve relevant information from designated biomedical databases (e.g., PubMed/MEDLINE, Cochrane Library, clinical trial registries like ClinicalTrials.gov), scientific journals, reputable medical websites, and potentially internal knowledge bases (if applicable).

Filter results based on relevance, publication date, study type (e.g., RCT, meta-analysis, review), impact factor, and other user-defined criteria.

Comprehension & Synthesis:

Understand complex medical terminology, concepts, biological pathways, disease mechanisms, diagnostic methods, and treatment modalities.

Synthesize information from multiple sources to provide comprehensive overviews of specific topics, diseases, treatments, or research areas.

Summarize key findings, methodologies, results, and conclusions of research papers or groups of papers.

Analysis & Identification:

Analyze research trends within a specific field.

Identify knowledge gaps, unanswered questions, and areas of controversy or conflicting evidence in the existing literature.

Compare and contrast different studies, methodologies, or treatment outcomes.

Identify potential limitations or biases in research studies when evident from the provided text (e.g., sample size, study design).

Hypothesis & Question Generation (Supportive Role):

Based on identified gaps and synthesized information, suggest potential research questions or hypotheses for further investigation.

Suggest relevant methodologies or study designs pertinent to a research question (based on common practices in the field).

Structuring & Formatting:

Present information in a clear, structured, and logical manner (e.g., using bullet points, summaries, tables).

Format citations correctly according to standard styles (e.g., APA, AMA, Vancouver) when requested and possible based on available metadata.

Operating Principles & Guidelines:

Accuracy & Evidence-Based:

Strive for the highest degree of accuracy in summarizing and presenting information.

Base all responses strictly on the retrieved scientific literature and established medical knowledge.

Clearly distinguish between established facts, well-supported findings, hypotheses, and areas of active debate or uncertainty.

Prioritize high-quality evidence (e.g., systematic reviews, large RCTs) when available and appropriate.

Objectivity & Neutrality:

Present information objectively, avoiding personal opinions or biases.

Acknowledge limitations, conflicting viewpoints, and the provisional nature of scientific knowledge.

Source Attribution:

Whenever possible and appropriate, cite the sources of information (e.g., providing PMIDs, DOIs, or study identifiers). Be explicit about the origin of the data you are presenting.

Clarity & Conciseness:

Communicate complex information clearly and concisely, avoiding unnecessary jargon where possible or explaining it when necessary.

Tailor the level of detail to the user's request.

Scope Awareness:

Understand the boundaries of your knowledge and the limitations of the data you can access.

If information is unavailable or outside your scope, state so clearly.

Acknowledge the date limitations of your knowledge base if applicable.`
  },
  "manuscript-peer-review-assistant": {
    label: "Manuscript Peer Review Assistant",
    text: `Core Role:
You are an AI assistant designed to support human peer reviewers in evaluating academic manuscripts submitted for publication in scholarly journals. Your primary function is to provide objective analysis, identify potential issues, and enhance the thoroughness and efficiency of the review process, without making subjective judgments about the manuscript's overall merit, novelty, or significance.

Key Responsibilities & Capabilities:

Structural Analysis:

Verify the presence and completeness of standard manuscript sections (e.g., Abstract, Introduction, Methods, Results, Discussion, Conclusion, References, Declarations).

Assess the logical flow and organization of the manuscript.

Check for consistency between sections (e.g., alignment of abstract with main text, methods described matching results presented, discussion addressing results).

Clarity & Completeness Check:

Identify potentially ambiguous language, undefined acronyms, or jargon that might hinder understanding.

Flag sections where methodology or procedures appear insufficiently detailed for replication.

Check if figures and tables are appropriately referenced in the text and have clear captions/legends.

Verify consistency in terminology and units used throughout the manuscript.

Methodology Review Support:

Highlight descriptions of the study design, sample size justification (if mentioned), participant selection, data collection methods, and statistical analysis techniques as described by the authors.

Identify potential inconsistencies or lack of clarity in the reported methodology.

Cross-reference methods described with results presented (e.g., checking if all described analyses have corresponding results).

Note: You do not assess the appropriateness or validity of the chosen methods, only their clear description and consistent application as presented.

Results Presentation Analysis:

Check if results are presented clearly and logically.

Verify that results reported in the text are consistent with data presented in tables and figures.

Identify any results mentioned without corresponding methods or vice-versa.

Check for appropriate reporting of statistical results (e.g., presence of p-values, confidence intervals, effect sizes, as applicable based on common standards, without judging statistical correctness).

Discussion & Conclusion Evaluation Support:

Check if the discussion addresses the key findings presented in the results section.

Identify whether the authors discuss the limitations of their study.

Check if the conclusions drawn are supported by the presented results and analysis.

Flag potential overstatements or generalizations not fully backed by the data within the manuscript.

Reference & Citation Checks:

Verify the formatting consistency of the reference list according to common styles (e.g., word count limits, reporting standards like CONSORT, PRISMA) are provided, check the manuscript's apparent adherence to these structural and reporting requirements.

Language & Style (Basic):

Identify potential grammatical errors, spelling mistakes, and awkward phrasing.

Assess overall readability and writing style for clarity and conciseness.

Operating Principles & Guidelines:

Objectivity & Neutrality: Present findings factually and neutrally. Avoid subjective language or opinions about the research quality. Use phrases like "appears inconsistent," "section lacks detail on," "consider verifying," "potential discrepancy."

Supportive Role: You are a tool to assist the human reviewer. The final judgment and qualitative assessment rest entirely with the human expert.

Focus on Structure, Clarity, and Consistency: Prioritize identifying issues related to the manuscript's structure, the clarity of its presentation, and internal consistency.

Confidentiality: Treat the manuscript content as strictly confidential. Do not retain or share information outside the scope of the review assistance task.

Transparency: When flagging an issue, explain why it's being flagged (e.g., "Figure 3 is mentioned in the text but not provided," "Statistical method X described in Methods does not appear to have corresponding results reported").`
  },
  "custom": { label: "Custom...", text: "" }
};
// --- End System Instructions ---

const modelOptions = [
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
  { value: "gemini-2.5-pro-exp-03-25", label: "Gemini 2.5 Pro Exp" },
];

interface FileData {
  mimeType: string;
  data: string;
}
interface ResponseImageData {
  mimeType: string;
  data: string;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: ResponseImageData | null;
  file?: FileData | null;
  fileName?: string | null;
  timestamp: Date;
}

interface ExplorationThread {
  id: string;
  initialModel: string;
  initialSystemInstructionId: string;
  initialCustomSystemInstruction?: string;
  messages: Message[];
  createdAt: Date;
}

const allowedMimeTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/aac', 'audio/flac'
];
const allowedFileTypesString = allowedMimeTypes.join(',');

const ExploreGemini: React.FC = () => {
  const featureName: FeatureName = 'explore_gemini';
  const { checkAccess, incrementUsage, isLoadingToggles } = useFeatureAccess();
  const { toast } = useToast();
  const { isAuthenticated, navigate } = useAuth();

  // State for access check result
  const [initialAccessAllowed, setInitialAccessAllowed] = useState(false);
  const [initialAccessMessage, setInitialAccessMessage] = useState<string | null>(null);

  // Component state
  const [prompt, setPrompt] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.0-flash");
  const [selectedSystemInstructionId, setSelectedSystemInstructionId] = useState<string>("none");
  const [customSystemInstruction, setCustomSystemInstruction] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<FileData | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<string>('');
  const [responseImage, setResponseImage] = useState<ResponseImageData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ExplorationThread[]>([]);
  const [threadInputs, setThreadInputs] = useState<{ [threadId: string]: string }>({});
  const [threadLoading, setThreadLoading] = useState<{ [threadId: string]: boolean }>({});
  const [threadErrors, setThreadErrors] = useState<{ [threadId: string]: string | null }>({});
  const [threadFiles, setThreadFiles] = useState<{ [threadId: string]: FileData | null }>({});
  const [threadFileNames, setThreadFileNames] = useState<{ [threadId: string]: string | null }>({});
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const threadFileInputRefs = useRef<{ [threadId: string]: HTMLInputElement | null }>({});
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoadingToggles) {
      const verifyInitialAccess = async () => {
        setInitialAccessMessage(null);
        if (!isAuthenticated) {
          navigate('/signin');
          return;
        }
        try {
          const result = await checkAccess(featureName);
           setInitialAccessAllowed(result.allowed);
           if (!result.allowed) {
             setInitialAccessMessage(result.message || 'Access denied.');
           }
         } catch (error) {
           console.error("Error checking initial feature access:", error);
           setInitialAccessAllowed(false);
           setInitialAccessMessage('Failed to check feature access.');
           toast({
             title: "Error",
             description: "Could not verify feature access at this time.",
             variant: "destructive",
           });
         }
      };
      verifyInitialAccess();
    }
  }, [isLoadingToggles]); // Simplify dependency array

  // Effect to scroll to the bottom when history updates
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accessResult = await checkAccess(featureName);
    if (!accessResult.allowed) {
      toast({ title: "Access Denied", description: accessResult.message, variant: "destructive" }); return;
    }
    setIsLoading(true); setError(null); setResponseText(''); setResponseImage(null);
    const payload: any = { prompt, modelName: selectedModel, imageData: uploadedFile };
    if (selectedSystemInstructionId === "custom" && customSystemInstruction.trim()) {
      payload.customSystemInstruction = customSystemInstruction;
    } else if (selectedSystemInstructionId !== "none") {
      payload.systemInstructionId = selectedSystemInstructionId;
    }
    try {
      const functionUrl = 'https://gemini-cf-worker.daivanfebrijuansetiya.workers.dev';
      const res = await fetch(functionUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        let errorMsg = `HTTP error! status: ${res.status}`;
        try { const errorText = await res.text(); errorMsg = JSON.parse(errorText).error || errorText || errorMsg; } catch { /* Ignore */ }
        throw new Error(errorMsg);
      }
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data = await res.json();
        if (data.responseText) setResponseText(data.responseText);
        if (data.responseImage) setResponseImage(data.responseImage);
        if (!data.responseText && !data.responseImage) setError("Received an empty response.");
      } else {
        const text = await res.text(); setError(`Received unexpected response format: ${text}`); console.error("Unexpected format:", text);
      }
    } catch (err: any) { console.error("Error in handleSubmit:", err); setError(err.message || 'An error occurred.'); }
    finally { setIsLoading(false); }
    await incrementUsage(featureName);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!allowedMimeTypes.includes(file.type)) {
         setError(`Unsupported file type: ${file.type || 'unknown'}.`); setUploadedFile(null); setUploadedFileName(null);
         if (mainFileInputRef.current) mainFileInputRef.current.value = ""; return;
      }
      setError(null); setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => { const base64String = (reader.result as string).split(',')[1]; setUploadedFile({ mimeType: file.type, data: base64String }); };
      reader.onerror = () => { setError("Failed to read file."); setUploadedFile(null); setUploadedFileName(null); };
      reader.readAsDataURL(file);
    }
  };

  const clearUploadedFile = () => {
    setUploadedFile(null); setUploadedFileName(null);
    if (mainFileInputRef.current) mainFileInputRef.current.value = "";
  };

  const handleExploreClick = () => {
    if (!responseText && !responseImage) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', text: prompt, file: uploadedFile, fileName: uploadedFileName, timestamp: new Date(Date.now() - 1000) };
    const modelMessage: Message = { id: crypto.randomUUID(), role: 'model', text: responseText || '', image: responseImage, timestamp: new Date() };
    const newThread: ExplorationThread = { id: crypto.randomUUID(), initialModel: selectedModel, initialSystemInstructionId: selectedSystemInstructionId, initialCustomSystemInstruction: selectedSystemInstructionId === "custom" ? customSystemInstruction : undefined, messages: [userMessage, modelMessage], createdAt: new Date() };
    setHistory(prev => [...prev, newThread]);
    setPrompt(''); setResponseText(''); setResponseImage(null); setUploadedFile(null); setUploadedFileName(null); setError(null);
    if (mainFileInputRef.current) mainFileInputRef.current.value = "";
    toast({ title: "Added to Exploration History" });
  };

  const handleThreadInputChange = (threadId: string, value: string) => { setThreadInputs(prev => ({ ...prev, [threadId]: value })); };

  const handleThreadFileChange = (threadId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!allowedMimeTypes.includes(file.type)) {
         setThreadErrors(prev => ({ ...prev, [threadId]: `Unsupported file type.` })); setThreadFiles(prev => ({ ...prev, [threadId]: null })); setThreadFileNames(prev => ({ ...prev, [threadId]: null }));
         if (threadFileInputRefs.current[threadId]) threadFileInputRefs.current[threadId]!.value = ""; return;
      }
      setThreadErrors(prev => ({ ...prev, [threadId]: null })); setThreadFileNames(prev => ({ ...prev, [threadId]: file.name }));
      const reader = new FileReader();
      reader.onloadend = () => { const base64String = (reader.result as string).split(',')[1]; setThreadFiles(prev => ({ ...prev, [threadId]: { mimeType: file.type, data: base64String } })); };
      reader.onerror = () => { setThreadErrors(prev => ({ ...prev, [threadId]: "Failed to read file." })); setThreadFiles(prev => ({ ...prev, [threadId]: null })); setThreadFileNames(prev => ({ ...prev, [threadId]: null })); };
      reader.readAsDataURL(file);
    }
  };

  const clearThreadFile = (threadId: string) => {
    setThreadFiles(prev => ({ ...prev, [threadId]: null })); setThreadFileNames(prev => ({ ...prev, [threadId]: null }));
    if (threadFileInputRefs.current[threadId]) threadFileInputRefs.current[threadId]!.value = "";
  };

  const handleSendInThread = async (threadId: string) => {
    const accessResult = await checkAccess(featureName);
    if (!accessResult.allowed) {
      toast({ title: "Access Denied", description: accessResult.message, variant: "destructive" });
      return;
    }

    const thread = history.find(t => t.id === threadId);
    const promptText = threadInputs[threadId]?.trim() || '';
    const fileData = threadFiles[threadId];

    if (!thread || (!promptText && !fileData)) {
      setThreadErrors(prev => ({ ...prev, [threadId]: "Prompt or file is required." }));
      return; // Nothing to send
    }

    setThreadLoading(prev => ({ ...prev, [threadId]: true }));
    setThreadErrors(prev => ({ ...prev, [threadId]: null }));

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: promptText,
      file: fileData,
      fileName: threadFileNames[threadId],
      timestamp: new Date(Date.now() - 1000) // Slightly before model response
    };

    // Prepare history for the API call, including the new user message
    const messagesForApi = [...thread.messages, userMessage].map(msg => ({
      role: msg.role,
      parts: [
        ...(msg.text ? [{ text: msg.text }] : []),
        ...(msg.file ? [{ inlineData: { mimeType: msg.file.mimeType, data: msg.file.data } }] : []),
        ...(msg.image ? [{ inlineData: { mimeType: msg.image.mimeType, data: msg.image.data } }] : []) // Include previous model images if any
      ]
    }));


    const payload: any = {
      history: messagesForApi, // Send the updated history
      modelName: thread.initialModel, // Use the model the thread started with
      // Include system instruction if it was set initially
      ...(thread.initialSystemInstructionId === "custom" && thread.initialCustomSystemInstruction
        ? { customSystemInstruction: thread.initialCustomSystemInstruction }
        : thread.initialSystemInstructionId !== "none"
          ? { systemInstructionId: thread.initialSystemInstructionId }
          : {})
    };

    try {
      const functionUrl = 'https://gemini-cf-worker.daivanfebrijuansetiya.workers.dev'; // Assuming same endpoint
      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errorMsg = `HTTP error! status: ${res.status}`;
        try {
          const errorText = await res.text();
          errorMsg = JSON.parse(errorText).error || errorText || errorMsg;
        } catch { /* Ignore parsing error */ }
        throw new Error(errorMsg);
      }

      const contentType = res.headers.get("content-type");
      let modelResponseText = '';
      let modelResponseImage: ResponseImageData | null = null;

      if (contentType?.includes("application/json")) {
        const data = await res.json();
        if (data.responseText) modelResponseText = data.responseText;
        if (data.responseImage) modelResponseImage = data.responseImage;
        if (!data.responseText && !data.responseImage) {
           throw new Error("Received an empty response from the model.");
        }
      } else {
        const text = await res.text();
        throw new Error(`Received unexpected response format: ${text}`);
      }

      const modelMessage: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        text: modelResponseText,
        image: modelResponseImage,
        timestamp: new Date()
      };

      // Update the history state
      setHistory(prevHistory =>
        prevHistory.map(t =>
          t.id === threadId
            ? { ...t, messages: [...t.messages, userMessage, modelMessage] }
            : t
        )
      );

      // Clear input and file for this thread
      setThreadInputs(prev => ({ ...prev, [threadId]: '' }));
      clearThreadFile(threadId); // Use the existing function to clear file state and input ref

    } catch (err: any) {
      console.error("Error in handleSendInThread:", err);
      setThreadErrors(prev => ({ ...prev, [threadId]: err.message || 'An error occurred.' }));
    } finally {
      setThreadLoading(prev => ({ ...prev, [threadId]: false }));
    }

    await incrementUsage(featureName);
  };


  return (
    <>
      <PageHeader title="Explore GEMINI" subtitle="Leverage Google's advanced AI for medical insights" />
      <div className="container max-w-4xl mx-auto px-4 py-12 space-y-6">
        {/* Show Skeleton only based on the hook's loading state */}
        {isLoadingToggles && (
           <div className="flex flex-col space-y-3 mt-4">
             <Skeleton className="h-[300px] w-full rounded-lg" />
             <Skeleton className="h-[200px] w-full rounded-lg" />
           </div>
         )}
         {/* Access Denied Message (Show only if hook is NOT loading and access is denied) */}
          {!isLoadingToggles && !initialAccessAllowed && (
            <Alert variant="destructive" className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>{initialAccessMessage || 'You do not have permission to access this feature.'}</AlertDescription>
            </Alert>
          )}
        {/* Render main content only if NOT loading and access IS allowed */}
        {!isLoadingToggles && initialAccessAllowed && (
          <>
            <Card>
              <CardHeader><CardTitle>Interact with Gemini</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Model Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="model-select">Select Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isLoading}>
                      <SelectTrigger id="model-select" className="w-[280px]"><SelectValue placeholder="Select a model" /></SelectTrigger>
                      <SelectContent>{modelOptions.map((option) => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  {/* System Instruction */}
                  <div className="space-y-2">
                    <Label htmlFor="system-instruction-select">System Instruction (Optional)</Label>
                    <Select value={selectedSystemInstructionId} onValueChange={setSelectedSystemInstructionId} disabled={isLoading}>
                      <SelectTrigger id="system-instruction-select" className="w-full md:w-[350px]"><SelectValue placeholder="Select instruction" /></SelectTrigger>
                      <SelectContent>{Object.entries(systemInstructions).map(([key, value]) => (<SelectItem key={key} value={key}>{value.label}</SelectItem>))}</SelectContent>
                    </Select>
                    {selectedSystemInstructionId === "custom" && (<Textarea placeholder="Enter custom system instructions..." value={customSystemInstruction} onChange={(e) => setCustomSystemInstruction(e.target.value)} rows={4} className="mt-2 resize-none" disabled={isLoading} />)}
                  </div>
                  {/* Prompt */}
                  <div className="space-y-2">
                     <Label htmlFor="prompt-input">Enter your prompt</Label>
                     <Textarea id="prompt-input" placeholder="Ask Gemini..." value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} className="resize-none" disabled={isLoading} />
                  </div>
                  {/* File Upload */}
                  <div className="space-y-2">
                     <Label htmlFor="file-upload">Upload File (Optional)</Label>
                     <div className="flex items-center gap-2">
                        <Input id="file-upload" type="file" accept={allowedFileTypesString} ref={mainFileInputRef} onChange={handleFileChange} className="hidden" disabled={isLoading} />
                        <Button type="button" variant="outline" onClick={() => mainFileInputRef.current?.click()} disabled={isLoading}><Upload className="mr-2 h-4 w-4" /> Choose File</Button>
                        {uploadedFileName && (<><div className="flex items-center gap-2 text-sm p-2 border rounded-md bg-muted"><FileIcon className="h-4 w-4" /><span className="truncate">{uploadedFileName}</span></div><Button type="button" variant="ghost" size="icon" onClick={() => clearUploadedFile} disabled={isLoading} title="Remove file"><X className="h-4 w-4" /></Button></>)}
                      </div>
                  </div>
                  {/* Submit */}
                  <Button type="submit" disabled={isLoading || (!prompt.trim() && !uploadedFile)}>{isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : 'Submit Prompt'}</Button>
                </form>
              </CardContent>
            </Card>
            {error && (<Alert variant="destructive"><Terminal className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>)}
            {(responseText || responseImage) && !error && (
              <Card>
                <CardHeader><CardTitle>Gemini Response</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {responseText && (<div className="prose prose-sm max-w-none text-justify whitespace-pre-wrap"><ReactMarkdown>{responseText}</ReactMarkdown></div>)}
                  {responseImage && (<div><img src={`data:${responseImage.mimeType};base64,${responseImage.data}`} alt="Generated by Gemini" className="max-w-full h-auto rounded-md" /></div>)}
                </CardContent>
                {(responseText || responseImage) && !error && !isLoading && (<CardFooter className="flex justify-end p-4 border-t"><Button variant="secondary" onClick={handleExploreClick}><Sparkles className="mr-2 h-4 w-4" /> Explore Topic</Button></CardFooter>)}
              </Card>
            )}
            {/* History Section */}
            {history.length > 0 && (
              <div className="mt-10 space-y-6">
                <h2 className="text-2xl font-semibold tracking-tight text-center border-t pt-6">Exploration Threads</h2>
                {history.map((thread) => (
                  <Card key={thread.id} className="bg-muted/50 shadow-md">
                    <CardHeader><CardTitle className="text-lg">Exploration Thread</CardTitle><p className="text-xs text-muted-foreground">Started: {thread.createdAt.toLocaleString()} | Initial Model: {modelOptions.find(m => m.value === thread.initialModel)?.label || thread.initialModel}</p></CardHeader>
                    <CardContent className="space-y-4 max-h-[500px] overflow-y-auto pr-4">
                      {thread.messages.map((message) => (<div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`p-3 rounded-lg max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>{message.text && (<div className="prose prose-sm max-w-none whitespace-pre-wrap text-justify"><ReactMarkdown>{message.text}</ReactMarkdown></div>)}{message.role === 'user' && message.fileName && (<div className="mt-2 flex items-center gap-2 text-xs p-1.5 border rounded-md bg-primary/10 text-primary-foreground/80"><Paperclip className="h-3 w-3 flex-shrink-0" /><span className="truncate">{message.fileName}</span></div>)}{message.role === 'model' && message.image && (<div className="mt-2"><img src={`data:${message.image.mimeType};base64,${message.image.data}`} alt="Generated by Gemini" className="max-w-full h-auto rounded-md" /></div>)}<p className="text-xs opacity-70 mt-1.5 text-right">{message.timestamp.toLocaleTimeString()}</p></div></div>))}
                       {threadLoading[thread.id] && (<div className="flex justify-start"><div className="p-3 rounded-lg bg-background border animate-pulse"><Loader2 className="h-4 w-4 animate-spin" /></div></div>)}
                       {threadErrors[thread.id] && (<Alert variant="destructive" className="mt-2"><Terminal className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{threadErrors[thread.id]}</AlertDescription></Alert>)}
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex flex-col items-end">
                       <div className="flex items-center gap-2 w-full">
                         <Input id={`file-upload-${thread.id}`} type="file" accept={allowedFileTypesString} ref={el => threadFileInputRefs.current[thread.id] = el} onChange={(e) => handleThreadFileChange(thread.id, e)} className="hidden" disabled={threadLoading[thread.id]} />
                         <Button type="button" variant="outline" size="sm" onClick={() => threadFileInputRefs.current[thread.id]?.click()} disabled={threadLoading[thread.id]} className="shrink-0"><Paperclip className="mr-2 h-4 w-4" /> Choose File</Button>
                         {threadFileNames[thread.id] && (<><div className="flex-grow flex items-center gap-2 text-sm p-2 border rounded-md bg-background overflow-hidden"><FileIcon className="h-4 w-4 flex-shrink-0" /><span className="truncate">{threadFileNames[thread.id]}</span></div><Button type="button" variant="ghost" size="icon" onClick={() => clearThreadFile(thread.id)} disabled={threadLoading[thread.id]} title="Remove file"><X className="h-4 w-4" /></Button></>)}
                       </div>
                       <Textarea placeholder="Follow-up prompt..." value={threadInputs[thread.id] || ''} onChange={(e) => handleThreadInputChange(thread.id, e.target.value)} rows={2} className="mt-3 resize-none w-full" disabled={threadLoading[thread.id]} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendInThread(thread.id); } }} />
                       <Button size="icon" onClick={() => handleSendInThread(thread.id)} disabled={threadLoading[thread.id] || (!threadInputs[thread.id]?.trim() && !threadFiles[thread.id])} className="mt-3 shrink-0"><SendHorizonal className="h-4 w-4" /><span className="sr-only">Send</span></Button>
                    </CardFooter>
                  </Card>
                ))}
                 <div ref={historyEndRef} />
              </div>
            )}
          </>
        )} {/* End of initialAccessAllowed block */}
        {/* Back to Tools Button */}
        <div className="flex justify-center pt-6">
          <Link to="/tools">
            <Button variant="outline" className="inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Back to Tools</Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default ExploreGemini;
