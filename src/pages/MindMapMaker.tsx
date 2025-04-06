import React, { useState, useCallback, useEffect, useMemo } from 'react'; // Removed useRef
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Keep CardHeader here for now, might be used elsewhere implicitly by Card
import PageHeader from '@/components/PageHeader'; // Import PageHeader
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger, // Added DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MindMapCanvas from '@/components/MindMapCanvas';
import { Node, Edge, Position } from 'reactflow';
import dagre from 'dagre';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import { Link } from 'react-router-dom'; // Import Link
import { ArrowLeft } from 'lucide-react'; // Import ArrowLeft

// Import Custom Nodes
import RootNode from '@/components/mindmap/RootNode';
import SubTopicNode from '@/components/mindmap/SubTopicNode';

// Define the expected response structure from the worker
interface WorkerResponse {
  summary: string;
  mindMap: { nodes: Node[]; edges: Edge[] };
}

// Define type for layout direction
type LayoutDirection = 'TB' | 'LR';

// --- Helper Function to Assign Node Types ---
const assignNodeTypes = (nodes: Node[], edges: Edge[]): Node[] => {
  const nodesWithTypes: Node[] = [];
  const childrenOfRoot = new Set<string>();

  edges.forEach(edge => {
    if (edge.source === 'root') {
      childrenOfRoot.add(edge.target);
    }
  });

  nodes.forEach(node => {
    let type = 'default';
    if (node.id === 'root') {
      type = 'rootNode';
    } else if (childrenOfRoot.has(node.id)) {
      type = 'subTopicNode';
    }
    nodesWithTypes.push({ ...node, type });
  });

  return nodesWithTypes;
};
// --- End Assign Node Types Function ---


// --- Dagre Layouting Function ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 40;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: LayoutDirection = 'TB') => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: direction, nodesep: 50, ranksep: 70 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    let width = nodeWidth;
    let height = nodeHeight;
    g.setNode(node.id, { label: node.data.label, width, height });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    const newNode = { ...node };
    if (nodeWithPosition) {
      newNode.position = {
        x: nodeWithPosition.x - (g.node(node.id).width / 2),
        y: nodeWithPosition.y - (g.node(node.id).height / 2),
      };
    } else {
      console.warn(`Node ${node.id} not found in layout graph.`);
      newNode.position = { x: 0, y: 0 };
    }

    const isHorizontal = direction === 'LR';
    newNode.targetPosition = isHorizontal ? Position.Left : Position.Top;
    newNode.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    return newNode;
  });

  return { nodes: layoutedNodes, edges: [...edges] };
};
// --- End Dagre Layouting Function ---


const MindMapMaker: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [originalMindMapData, setOriginalMindMapData] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);
  const [layoutedMindMapData, setLayoutedMindMapData] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nodeCounter, setNodeCounter] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [dialogInputValue, setDialogInputValue] = useState('');
  const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>('TB');
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false); // State for advanced modal

  const nodeTypes = useMemo(() => ({
    rootNode: RootNode,
    subTopicNode: SubTopicNode,
  }), []);

  useEffect(() => {
    if (originalMindMapData) {
      const nodesWithTypes = assignNodeTypes(originalMindMapData.nodes, originalMindMapData.edges);
      const newLayout = getLayoutedElements(nodesWithTypes, originalMindMapData.edges, layoutDirection);
      setLayoutedMindMapData(newLayout);
    } else {
      setLayoutedMindMapData(null);
    }
  }, [originalMindMapData, layoutDirection]);

  const handleNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setEditingNodeId(node.id);
    setDialogInputValue(node.data.label);
    setIsEditDialogOpen(true);
  }, []);

  const handleSaveLabel = () => {
    if (!editingNodeId || !dialogInputValue.trim()) return;
    const updateNodes = (nodes: Node[]) =>
      nodes.map((n) => {
        if (n.id === editingNodeId) {
          return { ...n, data: { ...n.data, label: dialogInputValue.trim() } };
        }
        return n;
      });
    setOriginalMindMapData((prev) => prev ? { ...prev, nodes: updateNodes(prev.nodes) } : null);
    setIsEditDialogOpen(false);
    setEditingNodeId(null);
    setDialogInputValue('');
  };

  const handleAddNode = () => {
    const newNodeLabel = window.prompt("Enter label for the new node:");
    if (newNodeLabel !== null && newNodeLabel.trim() !== '') {
      const newNodeId = `manual-node-${nodeCounter}`;
      setNodeCounter(nodeCounter + 1);
      const newNode: Node = {
        id: newNodeId,
        position: { x: 0, y: 0 },
        data: { label: newNodeLabel.trim() },
        type: 'default',
      };
      setOriginalMindMapData((prevData) => {
        const nodes = prevData ? [...prevData.nodes, newNode] : [newNode];
        const edges = prevData ? prevData.edges : [];
        return { nodes, edges };
      });
    }
  };

  const handleGenerate = async () => {
     if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setOriginalMindMapData(null);
    setSummary(null);

    try {
      const workerUrl = 'https://mindmap-generator-worker.daivanfebrijuansetiya.workers.dev';
      const response = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText || 'Failed to fetch'}`);
      }
      const data: WorkerResponse = await response.json();
      if (!data || typeof data.summary !== 'string' || typeof data.mindMap !== 'object' || !Array.isArray(data.mindMap.nodes) || !Array.isArray(data.mindMap.edges)) {
        console.error("Invalid response structure from worker:", data);
        throw new Error("Received invalid data structure from the server.");
      }
      const nodesWithTypes = assignNodeTypes(data.mindMap.nodes, data.mindMap.edges);
      const initialMindMapData = { nodes: nodesWithTypes, edges: data.mindMap.edges };
      setSummary(data.summary);
      setOriginalMindMapData(initialMindMapData);
    } catch (err: any) {
      console.error('Error generating mind map:', err);
      setError('Failed to generate mind map. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Download JSON Handler Removed ---

  return (
    <> {/* Wrap in fragment */}
      <PageHeader
        title="AI Mind Map Generator"
        subtitle="Generate visual mind maps from any topic using AI."
      />
      <div className="container mx-auto p-4 md:p-6 lg:p-8"> {/* Removed mt-12 */}
        <Card> {/* Removed top margin from Card */}
          {/* CardHeader removed */}
          <CardContent className="mt-6"> {/* Keep internal margin for now */}
            {/* Input and Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center flex-wrap">
            <Input
              type="text"
              placeholder="Enter your topic (e.g., Diabetes Mellitus Type 2)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
              className="flex-grow min-w-[200px]"
            />
            <Button onClick={handleGenerate} disabled={isLoading} className="whitespace-nowrap">
              {isLoading ? 'Generating...' : 'Generate Mind Map'}
            </Button>
            <Button onClick={handleAddNode} variant="outline" className="whitespace-nowrap">
              Add Node
            </Button>
            {/* Download JSON Button Removed */}
            {/* Layout Direction Select */}
            <div className="flex items-center gap-2 ml-auto">
              <Label htmlFor="layout-direction" className="whitespace-nowrap">Layout:</Label>
              <Select
                value={layoutDirection}
                onValueChange={(value: LayoutDirection) => setLayoutDirection(value)}
                disabled={!originalMindMapData || isLoading}
              >
                <SelectTrigger id="layout-direction" className="w-[150px]">
                  <SelectValue placeholder="Select Layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TB">Top to Bottom</SelectItem>
                  <SelectItem value="LR">Left to Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Display Summary Section */}
          {isLoading && <div className="text-center p-4 text-muted-foreground">Generating summary and mind map...</div>}
          {!isLoading && summary && (
            <div className="mb-6 p-4 border rounded-md bg-background shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-primary">AI Generated Summary</h3>
              {/* Use ReactMarkdown to render summary */}
              <div className="prose prose-sm max-w-none text-foreground text-justify"> {/* Add prose classes for basic styling */}
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Display Mind Map Canvas Section - Removed ref and bg class */}
          <div className="mt-4 h-[600px] border rounded-md"> {/* Removed bg-muted/40 */}
            {!isLoading && !layoutedMindMapData && !summary && <div className="flex items-center justify-center h-full text-muted-foreground">Enter a topic and click Generate</div>}
            {!isLoading && layoutedMindMapData && (
              <MindMapCanvas
                key={layoutDirection}
                initialNodes={layoutedMindMapData.nodes}
                initialEdges={layoutedMindMapData.edges}
                onNodeDoubleClick={handleNodeDoubleClick}
                nodeTypes={nodeTypes}
              />
            )}
             {!isLoading && summary && !layoutedMindMapData && error && <div className="flex items-center justify-center h-full text-red-500">{error}</div>}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">Powered by AI. Results may require review.</p>
        </CardFooter>
      </Card>

      {/* Edit Node Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
         <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Node Label</DialogTitle>
            <DialogDescription>
              Enter the new label for the selected node. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="node-label" className="text-right">
                Label
              </Label>
              <Input
                id="node-label"
                value={dialogInputValue}
                onChange={(e) => setDialogInputValue(e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveLabel(); }}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveLabel}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced Mind Map Modal */}
      <Dialog open={isAdvancedModalOpen} onOpenChange={setIsAdvancedModalOpen}>
        {/* Trigger is placed below */}
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col"> {/* Adjust size as needed */}
          <DialogHeader>
            <DialogTitle>Advanced Mind Map Generator</DialogTitle>
            <DialogDescription>
              Interact with the advanced mind map tool below. Close this dialog when finished.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow border rounded-md overflow-hidden">
            <iframe
              src="https://medimind.daivanlabs.site/"
              title="Advanced Mind Map Generator"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Buttons Section */}
      <div className="flex flex-col items-center gap-4 mt-8 mb-4"> {/* Changed to flex-col and removed justify-center (items-center handles horizontal centering in flex-col) */}
        {/* Advanced Mind Map Button */}
        <Button onClick={() => setIsAdvancedModalOpen(true)}>
          Advanced Mind Map Generator
        </Button>

        {/* Back to Tools Button */}
        <Link to="/tools">
          <Button variant="outline" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
        </Link>
      </div>
    </div>
  </> // Add missing closing fragment tag
  );
};

export default MindMapMaker;
