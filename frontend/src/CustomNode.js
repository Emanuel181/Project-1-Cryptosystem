// CustomNode.js

import React from 'react';
import { Handle } from 'react-flow-renderer';
import './CustomNode.css';

const CustomNode = ({ data }) => {
  return (
    <div className={`custom-node ${data.type}`}>
      <div className="custom-node-header">
        <div className="custom-node-icon">{data.icon}</div>
        <div className="custom-node-label">{data.label}</div>
      </div>
      {data.explanation && <div className="custom-node-body">{data.explanation}</div>}
      <Handle type="target" position="top" id="a" style={{ borderRadius: 0 }} />
      <Handle type="source" position="bottom" id="b" style={{ borderRadius: 0 }} />
    </div>
  );
};

export default CustomNode;
