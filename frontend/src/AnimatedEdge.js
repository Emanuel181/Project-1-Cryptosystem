// AnimatedEdge.js

import React from 'react';
import { getBezierPath } from 'react-flow-renderer';
import './AnimatedEdge.css';

const AnimatedEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path id={id} className="animated-edge-path" d={edgePath} markerEnd={markerEnd} style={style} />
    </>
  );
};

export default AnimatedEdge;
