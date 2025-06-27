import React from 'react'
import { ReactFlow, Controls, MiniMap, Background, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TurboNode from './TurboNode';

function RoadmapCanvas({initialNodes,initialEdges}:any) {
  const nodeTypes = { turbo: TurboNode };
  return (
    <div className="w-full h-full bg-gradient-to-br from-yellow-50 via-white to-blue-50 p-4 rounded-2xl shadow-2xl border border-yellow-100">
      <div className="w-full h-full rounded-xl border border-blue-200 overflow-hidden">
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
        >
          <Controls className="!bg-white/80 !shadow-lg !rounded-lg !border !border-blue-200" />
          <MiniMap className="!bg-white/80 !shadow-md !rounded-md !border !border-blue-200" />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  )
}

export default RoadmapCanvas
