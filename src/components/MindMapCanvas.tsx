import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MiniMap,
  BackgroundVariant,
  NodeMouseHandler, // Import type for the handler
} from 'reactflow'; // Changed from @reactflow/core
import 'reactflow/dist/style.css'; // Changed from @reactflow/core/dist/style.css

// Basic styling for the React Flow container
const rfStyle = {
  backgroundColor: '#ffffff', // Change to white
};

import { NodeTypes } from 'reactflow'; // Import NodeTypes type

interface MindMapCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodeDoubleClick?: NodeMouseHandler;
  nodeTypes?: NodeTypes; // Add prop for custom node types
}

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodeDoubleClick,
  nodeTypes, // Destructure the new prop
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when props change (e.g., new map generated)
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Memoize the ReactFlow component to prevent unnecessary re-renders
  const flow = useMemo(() => (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDoubleClick={onNodeDoubleClick}
      nodeTypes={nodeTypes} // Pass nodeTypes to ReactFlow
      fitView // Automatically fits the view to the nodes
      style={rfStyle}
      proOptions={{ hideAttribution: true }} // Hide React Flow attribution for cleaner look
    >
      <Controls />
      <MiniMap nodeStrokeWidth={3} zoomable pannable />
      {/* <Background variant={BackgroundVariant.Dots} gap={12} size={1} /> */} {/* Removed Background component */}
    </ReactFlow>
  ), [nodes, edges, onNodesChange, onEdgesChange, onConnect, nodeTypes, onNodeDoubleClick]); // Added missing dependencies

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {flow}
    </div>
  );
};

export default MindMapCanvas;
