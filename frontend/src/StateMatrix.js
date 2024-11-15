// StateMatrix.js

import React from 'react';
import './StateMatrix.css';

const StateMatrix = ({ matrix }) => {
  return (
    <div className="matrix-container">
      <table className="state-matrix">
        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                const hexValue = cell.toString(16).padStart(2, '0').toUpperCase();
                const decValue = cell;
                const binValue = cell.toString(2).padStart(8, '0');
                const hue = (cell / 255) * 360; // Map byte value to hue (0-360)
                const backgroundColor = `hsl(${hue}, 80%, 50%)`;
                return (
                  <td
                    key={colIndex}
                    className="cell"
                    style={{
                      '--row': rowIndex,
                      '--col': colIndex,
                      backgroundColor,
                    }}
                    title={`Hex: ${hexValue}\nDec: ${decValue}\nBin: ${binValue}`}
                  >
                    {hexValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StateMatrix;
