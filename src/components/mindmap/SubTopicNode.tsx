import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from "@/lib/utils";

// memoize the node component
const SubTopicNode: React.FC<NodeProps> = ({ data, sourcePosition = Position.Bottom, targetPosition = Position.Top }) => {
  return (
    <>
      {/* Handle for incoming connections */}
      <Handle
        type="target"
        position={targetPosition}
        className="!bg-teal-500 w-2 h-2"
      />

      {/* Node Content */}
      <div className={cn(
        "px-3 py-1.5 shadow rounded-full border", // Rounded-full for oval-like shape
        "bg-gradient-to-r from-emerald-50 to-green-100", // Different gradient
        "border-emerald-300",
        "text-emerald-800 text-sm" // Slightly smaller text
      )}>
        {data.label}
      </div>

      {/* Handle for outgoing connections */}
      <Handle
        type="source"
        position={sourcePosition}
        className="!bg-emerald-500 w-2 h-2"
      />
    </>
  );
};

export default memo(SubTopicNode);
