import React from 'react';

/**
 * ComplexityTable Component
 * Renders description and complexities (Time/Space/Stability/Sorted Constraints)
 * dynamically based on selected algorithm and module type ('sorting' | 'searching').
 */
export default function ComplexityTable({ id, algoKey, infoMap, type }) {
  const info = infoMap[algoKey];
  if (!info) return null;

  return (
    <div id={`edu-card-${id}`} className="edu-card">
      <div className="edu-header">
        <h2 className="edu-title">{info.title} Details</h2>
      </div>
      <p className="edu-description">{info.description}</p>
      
      <div className="complexity-table-wrapper">
        <table className="complexity-table">
          <thead>
            <tr>
              <th>Time (Best)</th>
              <th>Time (Avg)</th>
              <th>Time (Worst)</th>
              <th>Space Complexity</th>
              <th>{type === 'searching' ? 'Needs Sorted' : 'Stability'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code className={`best-${id}`}>{info.best}</code></td>
              <td><code className={`avg-${id}`}>{info.avg}</code></td>
              <td><code className={`worst-${id}`}>{info.worst}</code></td>
              <td><code className={`space-${id}`}>{info.space}</code></td>
              <td><code className={`stable-${id}`}>{info.stable}</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
