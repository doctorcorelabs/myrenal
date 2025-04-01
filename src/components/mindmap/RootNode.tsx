import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from "@/lib/utils"; // Assuming you use Shadcn's utility for class names

// memoize the node component to prevent unnecessary re-renders
const RootNode: React.FC<NodeProps> = ({ data, sourcePosition = Position.Bottom }) => {
  return (
    <>
      {/* Handle for incoming connections (usually none for root) */}
      {/* <Handle type="target" position={Position.Top} className="!bg-teal-500" /> */}

      {/* Node Content */}
      <div className={cn(
        "px-4 py-2 shadow-md rounded-md border-2 border-stone-400",
        "bg-gradient-to-br from-sky-100 to-sky-200", // Example gradient background
        "text-sky-800 font-semibold" // Example text styling
      )}>
        {data.label}
      </div>

      {/* Handle for outgoing connections */}
      <Handle
        type="source"
        position={sourcePosition}
        className="!bg-sky-500 w-2 h-2" // Style the handle
      />
    </>
  );
};

export default memo(RootNode);
