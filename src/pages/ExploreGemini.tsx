import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import PageHeader from '@/components/PageHeader';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Upload, X, File as FileIcon, ArrowLeft } from "lucide-react"; // Added ArrowLeft
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

Verify the formatting consistency of the reference list according to common styles (if specified) or internal consistency.

Check if all in-text citations correspond to an entry in the reference list and vice-versa (basic matching).

Note: You cannot verify the accuracy or relevance of the cited content itself.

Adherence to Guidelines (If Provided):

If specific journal guidelines (e.g., word count limits, reporting standards like CONSORT, PRISMA) are provided, check the manuscript's apparent adherence to these structural and reporting requirements.

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
  "custom": { label: "Custom...", text: "" } // Added custom option identifier
};
// --- End System Instructions ---


// Define model options
const modelOptions = [
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" }, 
  { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" }, // Added new model
  { value: "gemini-2.5-pro-exp-03-25", label: "Gemini 2.5 Pro Exp" }, 
];

// Interface for file data (uploaded) and image data (response)
interface FileData { 
  mimeType: string;
  data: string; // Base64 encoded data
}
interface ResponseImageData { 
  mimeType: string;
  data: string; 
}

// Define allowed MIME types and create accept string
const allowedMimeTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 
  'application/pdf', 
  'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/aac', 'audio/flac'
];
const allowedFileTypesString = allowedMimeTypes.join(',');

const ExploreGemini: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.0-flash"); // Changed default model
  const [selectedSystemInstructionId, setSelectedSystemInstructionId] = useState<string>("none"); 
  const [customSystemInstruction, setCustomSystemInstruction] = useState<string>(''); // State for custom instruction text
  const [uploadedFile, setUploadedFile] = useState<FileData | null>(null); 
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null); 
  const [responseText, setResponseText] = useState<string>(''); 
  const [responseImage, setResponseImage] = useState<ResponseImageData | null>(null); 
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponseText(''); 
    setResponseImage(null); 
    
    // Construct payload
    const payload: any = {
        prompt,
        modelName: selectedModel,
        imageData: uploadedFile,
    };

    // Add system instruction based on selection
    if (selectedSystemInstructionId === "custom") {
        if (customSystemInstruction.trim()) {
            payload.customSystemInstruction = customSystemInstruction;
        }
    } else if (selectedSystemInstructionId !== "none") {
        payload.systemInstructionId = selectedSystemInstructionId;
    }

    try {
      const functionUrl = '/.netlify/functions/explore_gemini'; 
      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Attempt to read error from body, even if it's potentially a stream
        let errorMsg = `HTTP error! status: ${res.status}`;
        try {
          const errorText = await res.text(); // Read error as text
          try {
             // Try parsing as JSON first
             const errorData = JSON.parse(errorText);
             errorMsg = errorData.error || JSON.stringify(errorData);
          } catch (jsonParseError) {
             // If not JSON, use the raw text
             errorMsg = errorText || errorMsg;
          }
        } catch (readError) {
          // Ignore if reading error body fails
        }
        throw new Error(errorMsg);
      }

      // --- Conditional Response Handling ---
      const useStreaming = selectedModel === "gemini-2.5-pro-exp-03-25";

      if (useStreaming) {
        // --- Streaming Response Handling ---
        console.log("Handling response as stream...");
        if (!res.body) {
          throw new Error("Response body is missing for streaming.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let currentText = '';
        // Removed buffer and currentImage initialization here

        while (!done) {
          try {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
              const chunk = decoder.decode(value, { stream: !done });

              // Attempt to parse the chunk as JSON (for potential image data)
              try {
                const jsonData = JSON.parse(chunk);
                if (jsonData && typeof jsonData === 'object' && jsonData.type === 'image' && jsonData.mimeType && jsonData.data) {
                  // It's image data, update the image state
                  setResponseImage({ mimeType: jsonData.mimeType, data: jsonData.data });
                  // Optionally clear text if image is received? Or allow both? Assuming allow both for now.
                } else {
                  // Parsed successfully but not the expected image format, treat as text
                  currentText += chunk;
                  setResponseText(prev => prev + chunk); // Append directly
                }
              } catch (jsonParseError) {
                // Parsing failed, assume it's a text chunk
                if (chunk.startsWith('[STREAM_ERROR]:')) {
                    console.error("Stream error detected:", chunk);
                    setError("An error occurred during generation: " + chunk.substring(15)); // Show error message
                    done = true; // Stop processing on error
                } else {
                    currentText += chunk;
                    setResponseText(prev => prev + chunk); // Append directly
                }
              }
            }
          } catch (streamReadError: any) {
             console.error("Stream read error:", streamReadError);
             setError(`Stream read error: ${streamReadError.message}`);
             done = true;
          }
        }
        // --- End Streaming Response Handling ---
      } else {
        // --- Standard JSON Response Handling ---
        console.log("Handling response as JSON...");
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          if (data.responseText) {
            setResponseText(data.responseText);
          }
          if (data.responseImage) {
            setResponseImage(data.responseImage);
          }
          if (!data.responseText && !data.responseImage) {
             setError("Received an empty response from the model.");
          }
        } else {
          const responseText = await res.text();
          setError(`Received unexpected response format: ${responseText}`);
          console.error("Unexpected response format:", responseText);
        }
        // --- End Standard JSON Response Handling ---
      }
      // --- End Conditional Response Handling ---


      // // --- Original Code (Now Replaced by Conditional Logic) ---
      // const contentType = res.headers.get("content-type");
      // if (contentType && contentType.indexOf("application/json") !== -1) {
      //   const data = await res.json();
      //   if (data.responseText) {
      //     setResponseText(data.responseText);
      //   }
      //   // Temporarily disable image handling for streaming
      //   // if (data.responseImage) {
      //   //   setResponseImage(data.responseImage);
      //   // }
      //   if (!data.responseText /* && !data.responseImage */) {
      //      setError("Received an empty response from the model.");
      //   }
      // } else {
      //   const responseText = await res.text();
      //   throw new Error(`Received unexpected response format: ${responseText}`);
      // }
      // // --- End Original JSON Response Handling ---


    } catch (err: any) {
      console.error("Error in handleSubmit:", err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!allowedMimeTypes.includes(file.type)) {
         setError(`Unsupported file type: ${file.type || 'unknown'}. Please upload an image, PDF, or audio file.`);
         setUploadedFile(null);
         setUploadedFileName(null);
         if (fileInputRef.current) {
             fileInputRef.current.value = ""; 
         }
         return;
      }

      setError(null); 
      setUploadedFileName(file.name); 
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1]; 
        setUploadedFile({ 
          mimeType: file.type, 
          data: base64String,
        });
      };
      reader.onerror = () => {
        setError("Failed to read the selected file.");
        setUploadedFile(null); 
        setUploadedFileName(null);
      };
      reader.readAsDataURL(file); 
    }
  };

  // Clear uploaded file
  const clearUploadedFile = () => {
    setUploadedFile(null); 
    setUploadedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  return (
    <>
      <PageHeader 
        title="Explore GEMINI" 
        subtitle="Leverage Google's advanced AI for medical insights" 
      />
      <div className="container max-w-4xl mx-auto px-4 py-12 space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Interact with Gemini</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Model Selection Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="model-select">Select Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isLoading}>
                  <SelectTrigger id="model-select" className="w-[280px]">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* System Instruction Dropdown & Custom Input */}
              <div className="space-y-2">
                <Label htmlFor="system-instruction-select">System Instruction (Optional)</Label>
                <Select value={selectedSystemInstructionId} onValueChange={setSelectedSystemInstructionId} disabled={isLoading}>
                  <SelectTrigger id="system-instruction-select" className="w-full md:w-[350px]">
                    <SelectValue placeholder="Select instruction" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(systemInstructions).map(([id, { label }]) => (
                      <SelectItem key={id} value={id}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Conditionally render Textarea for custom input */}
                {selectedSystemInstructionId === "custom" && (
                  <Textarea
                    placeholder="Enter your custom system instructions here..."
                    value={customSystemInstruction}
                    onChange={(e) => setCustomSystemInstruction(e.target.value)}
                    rows={4}
                    className="mt-2 resize-none"
                    disabled={isLoading}
                  />
                )}
              </div>

              {/* Prompt Textarea */}
              <div className="space-y-2">
                 <Label htmlFor="prompt-input">Enter your prompt</Label> {/* Updated label */}
                 <Textarea
                   id="prompt-input"
                   placeholder="Ask Gemini anything related to medical topics, or describe the uploaded file..."
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   rows={5}
                   className="resize-none"
                   disabled={isLoading}
                 />
              </div>

              {/* File Upload Section - Re-enabled */}
              <div className="space-y-2">
                 <Label htmlFor="file-upload">Upload File (Optional - Image, PDF, Audio)</Label>
                 <div className="flex items-center gap-2">
                    <Input
                      id="file-upload"
                      type="file"
                      accept={allowedFileTypesString}
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isLoading} // Re-enable based on loading state
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()} // Re-enable click
                      disabled={isLoading} // Re-enable based on loading state
                    >
                      <Upload className="mr-2 h-4 w-4" /> Choose File
                    </Button>
                    {uploadedFileName && (
                      <>
                        <div className="flex items-center gap-2 text-sm p-2 border rounded-md bg-muted">
                          <FileIcon className="h-4 w-4" />
                          <span className="truncate max-w-[150px]">{uploadedFileName}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={clearUploadedFile} // Re-enable clear
                          disabled={isLoading} // Re-enable based on loading state
                          title="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  {/* Removed disabled message */}
              </div>

              {/* Update disabled condition for submit button - allow submit if prompt OR file exists */}
              <Button type="submit" disabled={isLoading || (!prompt.trim() && !uploadedFile)}>
                {isLoading ? 'Generating...' : 'Submit Prompt'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
           <Alert variant="destructive">
             <Terminal className="h-4 w-4" />
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
        )}

        {/* Conditionally render response card if there's text or image and no error */}
        {(responseText || responseImage) && !error && (
          <Card>
            <CardHeader>
              <CardTitle>Gemini Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Display Text Response (ReactMarkdown handles incremental updates) */}
              {responseText && (
                <div className="prose prose-sm max-w-none text-justify whitespace-pre-wrap"> {/* Re-added text-justify */}
                  <ReactMarkdown>{responseText}</ReactMarkdown>
                </div>
              )}
              {/* Display Image Response (Re-enabled) */}
              {responseImage && (
                <div>
                  <img
                    src={`data:${responseImage.mimeType};base64,${responseImage.data}`}
                    alt="Generated by Gemini"
                    className="max-w-full h-auto rounded-md"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Back to Tools Button */}
        <div className="flex justify-center pt-6"> 
          <Link to="/tools">
            <Button variant="outline" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Tools
            </Button>
          </Link>
        </div>

      </div>
    </>
  );
};

export default ExploreGemini;
