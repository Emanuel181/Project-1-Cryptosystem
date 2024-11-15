// FlowDiagram.js

import React from 'react';
import ReactFlow, {
  Controls,
  Background,
} from 'react-flow-renderer';
import CustomNode from './CustomNode';
import AnimatedEdge from './AnimatedEdge';
import './FlowDiagram.css'; // Import the CSS file


const FlowDiagram = ({ steps, currentStep, onNodeClick }) => {
  const nodeTypes = {
    customNode: CustomNode,
  };

  const edgeTypes = {
    animatedEdge: AnimatedEdge,
  };

  // Define node icons based on step types
  const getNodeIcon = (type) => {
    switch (type) {
      case 'plaintext':
        return '📝';
      case 'ciphertext':
        return '🔐';
      case 'operation':
        return '⚙️';
      case 'round':
        return '🔄';
      default:
        return '🔷';
    }
  };

  // Create nodes
  const nodes = steps.map((step, index) => {
    let nodeType = 'operation';
    if (step.id.includes('plaintext')) nodeType = 'plaintext';
    else if (step.id.includes('ciphertext')) nodeType = 'ciphertext';
    else if (step.id.includes('Round')) nodeType = 'round';

    return {
      id: step.id,
      type: 'customNode',
      data: {
        label: step.label,
        explanation: step.explanation,
        type: nodeType,
        icon: getNodeIcon(nodeType),
      },
    position: { x: 50, y: index * 150 }, // Adjusted positions
      style: {
      width: '200px', // Reduced width
      },
    };
  });

  // Create edges
  const edges = steps.slice(1).map((step, index) => ({
    id: `e${index}`,
    source: steps[index].id,
    target: step.id,
    type: 'animatedEdge',
    animated: true,
    style: { stroke: '#555' },
  }));

return (
    <div
      style={{
        height: '600px',
        width: '800px',
        border: '2px solid #007bff',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f8f9fa', // Light gray background
        overflow: 'auto',
        margin: '20px auto',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        fitView
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default FlowDiagram;
